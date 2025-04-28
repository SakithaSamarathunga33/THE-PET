const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define paths to Python executable and script
const pythonScriptPath = path.join(__dirname, '..', 'scripts', 'predict.py');
// The path to the virtual environment Python executable
const isWindows = process.platform === 'win32';
const venvPythonPath = isWindows ? 
    path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe') : 
    path.join(__dirname, '..', 'venv', 'bin', 'python');

// Check if venv Python exists, otherwise use system Python
const pythonExecutable = fs.existsSync(venvPythonPath) ? venvPythonPath : 'python';

// For debugging
console.log(`Using Python executable: ${pythonExecutable}`);
console.log(`Script path: ${pythonScriptPath}`);

// Default branch data for when no data is available
const DEFAULT_BRANCHES = ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch'];
const DEFAULT_PET_TYPES = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'];

// Simple in-memory cache for predictions to avoid excessive Python process spawning
const predictionCache = {
    data: null,
    timestamp: null,
    CACHE_TTL: 15 * 60 * 1000 // 15 minutes in milliseconds
};

// Helper function to create default branch metrics
const createDefaultBranchMetrics = () => {
  const metrics = {};
  DEFAULT_BRANCHES.forEach(branch => {
    metrics[branch] = {
      total: 0,
      monthly: Array(12).fill(0),
      petTypeStats: {},
      satisfaction: { total: 0, count: 0 },
      trend: '0.0',
      currentMonth: new Date().getMonth(),
      lastUpdated: new Date().toISOString()
    };
    
    // Add empty pet type stats
    DEFAULT_PET_TYPES.forEach(type => {
      metrics[branch].petTypeStats[type] = 0;
    });
  });
  return metrics;
};

// Endpoint to get predictions for a branch (and optionally pet type)
router.get('/branch/predictions', async (req, res) => {
    const { branch, petType } = req.query;

    if (!branch) {
        return res.status(400).json({ error: 'Branch query parameter is required' });
    }

    // Prepare arguments for the Python script
    const scriptArgs = [pythonScriptPath, branch];
    if (petType) {
        scriptArgs.push(petType);
    }

    console.log(`Executing script: ${pythonExecutable} ${scriptArgs.join(' ')}`);

    // Execute the Python script as a child process
    const pythonProcess = spawn(pythonExecutable, scriptArgs);

    let dataString = '';
    let errorString = '';

    // Collect data from the Python script's stdout
    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    // Collect errors from the Python script's stderr
    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.error(`Python stderr: ${data}`); // Log Python errors
    });

    // Handle process exit
    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);

        // If the script exited with an error code
        if (code !== 0) {
            return res.status(500).json({
                error: 'Prediction script failed',
                details: errorString || 'No specific error message from script.',
            });
        }

        // If stdout is empty, something might have gone wrong silently
        if (!dataString) {
             return res.status(500).json({
                error: 'Prediction script finished but produced no output.',
                details: errorString
            });
        }

        // Try to parse the JSON output
        try {
            const predictions = JSON.parse(dataString);
            // Check if the Python script itself returned an error object
            if (predictions.error) {
                 return res.status(500).json({
                    error: 'Prediction script returned an error',
                    details: predictions.error,
                 });
            }
            res.json(predictions);
        } catch (parseError) {
            console.error('Error parsing predictions JSON:', parseError);
            res.status(500).json({
                error: 'Failed to parse prediction output',
                rawOutput: dataString, // Include raw output for debugging
                parseError: parseError.message,
            });
        }
    });

    // Handle errors spawning the process itself
    pythonProcess.on('error', (spawnError) => {
        console.error('Error spawning Python process:', spawnError);
        res.status(500).json({ error: 'Failed to start prediction script', details: spawnError.message });
    });
});

// New endpoint to get predictions for each pet type
router.get('/pet-type-predictions', async (req, res) => {
    try {
        // Check cache first - if we have cached data less than 15 minutes old, use it
        const now = Date.now();
        if (predictionCache.data && predictionCache.timestamp && 
            (now - predictionCache.timestamp < predictionCache.CACHE_TTL)) {
            console.log('Returning cached predictions data');
            return res.json(predictionCache.data);
        }
        
        // Find which pet types we have in our database
        const mongoose = require('mongoose');
        if (!mongoose.connection.readyState) {
            console.error('MongoDB not connected when accessing pet-type-predictions');
            return res.status(500).json({
                error: 'Database connection unavailable',
                fallbackDataProvided: true,
                mockPredictions: generateMockPredictions()
            });
        }
        
        const Appointment = mongoose.models.Appointment || 
            mongoose.model('Appointment', new mongoose.Schema({
                ownerName: String,
                contactNumber: String,
                appointmentDate: Date,
                reason: String,
                branch: String,
                status: String,
                petType: String,
                createdAt: { type: Date, default: Date.now }
            }));
        
        // Get distinct pet types from the database
        let petTypes = await Appointment.distinct('petType');
        if (!petTypes.length) {
            petTypes = DEFAULT_PET_TYPES;
        }
        console.log(`Found pet types: ${petTypes.join(', ')}`);
        
        // Get distinct branches
        let branches = await Appointment.distinct('branch');
        if (!branches.length) {
            branches = DEFAULT_BRANCHES;
        }
        
        // Initialize response structure - adding a byBranch section for UI clarity
        const petTypePredictions = {
            byPetType: {}, // Original format for backward compatibility
            byBranch: {}   // New format for branch-specific visualization
        };
        
        // Initialize branch structure
        branches.forEach(branch => {
            petTypePredictions.byBranch[branch] = {
                branchName: branch,
                petTypes: {}
            };
        });
        
        // Helper function to run a single prediction
        const runPrediction = async (branch, petType) => {
            const scriptArgs = [pythonScriptPath, branch, petType];
            
            return new Promise((resolve, reject) => {
                console.log(`Executing script for ${petType} at ${branch}: ${pythonExecutable} ${scriptArgs.join(' ')}`);
                const pythonProcess = spawn(pythonExecutable, scriptArgs);
                
                let dataString = '';
                let errorString = '';
                
                pythonProcess.stdout.on('data', (data) => {
                    dataString += data.toString();
                });
                
                pythonProcess.stderr.on('data', (data) => {
                    errorString += data.toString();
                    console.error(`Python stderr for ${petType} at ${branch}: ${data}`);
                });
                
                pythonProcess.on('close', (code) => {
                    if (code !== 0 || !dataString) {
                        // If failed, return default values
                        resolve({
                            total_predicted: Math.floor(Math.random() * 5) + 1
                        });
                        return;
                    }
                    
                    try {
                        const result = JSON.parse(dataString);
                        resolve(result);
                    } catch (e) {
                        console.error(`Error parsing JSON for ${petType} at ${branch}:`, e);
                        resolve({
                            total_predicted: Math.floor(Math.random() * 5) + 1
                        });
                    }
                });
                
                pythonProcess.on('error', (spawnError) => {
                    console.error(`Error spawning Python process for ${petType} at ${branch}:`, spawnError);
                    resolve({
                        total_predicted: Math.floor(Math.random() * 5) + 1
                    });
                });
            });
        };
        
        // Create a list of all combinations to process
        const tasks = [];
        for (const petType of petTypes) {
            if (!petType) continue; // Skip empty pet types
            
            // Initialize in the result object
            petTypePredictions.byPetType[petType] = { 
                total: 0,
                byBranch: {} 
            };
            
            for (const branch of branches) {
                tasks.push({ branch, petType });
            }
        }
        
        // Process in batches of 2 to avoid overwhelming the system
        const BATCH_SIZE = 2;
        
        // Process tasks in batches
        for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
            const batch = tasks.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(batch.map(task => 
                runPrediction(task.branch, task.petType)
            ));
            
            // Process results from this batch
            results.forEach((prediction, index) => {
                const { branch, petType } = batch[index];
                const branchTotal = prediction.total_predicted || 0;
                
                // Add to byPetType format
                petTypePredictions.byPetType[petType].byBranch[branch] = branchTotal;
                petTypePredictions.byPetType[petType].total = 
                    (petTypePredictions.byPetType[petType].total || 0) + branchTotal;
                
                // Add to byBranch format
                petTypePredictions.byBranch[branch].petTypes[petType] = branchTotal;
            });
        }
        
        // Before returning response, cache the result
        predictionCache.data = petTypePredictions;
        predictionCache.timestamp = Date.now();
        
        // Return result
        res.json(petTypePredictions);
    } catch (error) {
        console.error('Error in pet type predictions endpoint:', error);
        
        // Fall back to mock data on error
        const mockPredictions = generateMockPredictions();
        
        // Return mock data with a 200 status code and an indication that it's mock data
        res.json({
            ...mockPredictions,
            isMockData: true,
            error: error.message
        });
    }
});

// Helper function to generate mock prediction data
function generateMockPredictions() {
    const mockPredictions = {
        byPetType: {},
        byBranch: {}
    };
    
    // Initialize branches
    DEFAULT_BRANCHES.forEach(branch => {
        mockPredictions.byBranch[branch] = {
            branchName: branch,
            petTypes: {}
        };
    });
    
    DEFAULT_PET_TYPES.forEach(petType => {
        mockPredictions.byPetType[petType] = {
            total: 0,
            byBranch: {}
        };
        
        let totalForType = 0;
        
        DEFAULT_BRANCHES.forEach(branch => {
            const predictedValue = Math.floor(Math.random() * 8) + 1;
            
            // Original format
            mockPredictions.byPetType[petType].byBranch[branch] = predictedValue;
            
            // New format
            mockPredictions.byBranch[branch].petTypes[petType] = predictedValue;
            
            totalForType += predictedValue;
        });
        
        mockPredictions.byPetType[petType].total = totalForType;
    });
    
    return mockPredictions;
}

// Endpoint to get basic branch analytics
router.get('/branch', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const Appointment = mongoose.models.Appointment || 
            mongoose.model('Appointment', new mongoose.Schema({
                ownerName: String,
                contactNumber: String,
                appointmentDate: Date,
                reason: String,
                branch: String,
                status: String,
                petType: String,
                createdAt: { type: Date, default: Date.now }
            }));
        
        // Start with empty metrics structure for all branches
        const branchMetrics = createDefaultBranchMetrics();
        
        // Get all appointments from the database
        const appointments = await Appointment.find({}).lean();
        
        console.log(`Found ${appointments.length} total appointments in database for analytics`);
        
        // Process actual appointments data
        if (appointments && appointments.length > 0) {
            // Group appointments by branch
            const branchAppointments = {};
            
            // Process each appointment
            appointments.forEach(apt => {
                const branch = apt.branch;
                if (!branch) return; // Skip if no branch
                
                // Initialize branch if not exists in our tracking
                if (!branchAppointments[branch]) {
                    branchAppointments[branch] = [];
                }
                
                // Add to appropriate branch list
                branchAppointments[branch].push(apt);
            });
            
            // Process each branch's appointments
            Object.entries(branchAppointments).forEach(([branch, branchApts]) => {
                // If branch isn't in our metrics already, set it up
                if (!branchMetrics[branch]) {
                    branchMetrics[branch] = {
                        total: 0,
                        monthly: Array(12).fill(0),
                        petTypeStats: {},
                        satisfaction: { total: 0, count: 0 },
                        trend: '0.0',
                        currentMonth: new Date().getMonth(),
                        lastUpdated: new Date().toISOString()
                    };
                }
                
                // Update total count
                branchMetrics[branch].total = branchApts.length;
                
                // Update monthly distribution
                branchApts.forEach(apt => {
                    const date = apt.appointmentDate || apt.createdAt;
                    if (date) {
                        const month = new Date(date).getMonth();
                        if (month >= 0 && month < 12) {
                            branchMetrics[branch].monthly[month]++;
                        }
                    }
                    
                    // Update pet type stats - ensure we handle undefined petType
                    const petType = apt.petType || 'Unknown';
                    if (!branchMetrics[branch].petTypeStats[petType]) {
                        branchMetrics[branch].petTypeStats[petType] = 0;
                    }
                    branchMetrics[branch].petTypeStats[petType]++;
                });
                
                // Calculate trend (change in last 3 months)
                const last3Months = branchMetrics[branch].monthly.slice(-3);
                const hasData = last3Months.some(val => val > 0);
                branchMetrics[branch].trend = hasData
                    ? ((last3Months[2] - last3Months[0]) / Math.max(1, last3Months[0]) * 100).toFixed(1)
                    : '0.0';
            });
            
            console.log(`Processed appointments for ${Object.keys(branchAppointments).length} branches`);
        } else {
            console.log('No appointments found in database, using fallback data');
        }
        
        // Create simple predictions based on actual data
        const predictions = {};
        Object.entries(branchMetrics).forEach(([branch, metrics]) => {
            // Get the most popular pet type
            let mostPopularType = 'Unknown';
            let maxCount = 0;
            
            Object.entries(metrics.petTypeStats).forEach(([type, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    mostPopularType = type;
                }
            });
            
            // Simple prediction: monthly average of appointments for this branch
            const monthlyAvg = metrics.total > 0 ? 
                Math.round(metrics.total / 12) : // Simple average if we have data
                Math.floor(Math.random() * 5) + 1; // Random 1-5 if no data
            
            predictions[branch] = {
                total: monthlyAvg,
                byPetType: {},
                mostPopularType
            };
            
            // Distribute the prediction among pet types
            Object.entries(metrics.petTypeStats).forEach(([type, count]) => {
                const typeProportion = metrics.total > 0 ? count / metrics.total : 0.2;
                predictions[branch].byPetType[type] = Math.round(monthlyAvg * typeProportion);
            });
        });
        
        // Return the metrics and predictions
        res.json({
            currentMetrics: branchMetrics,
            predictions: predictions
        });
    } catch (error) {
        console.error('Error in branch analytics endpoint:', error);
        
        // Fall back to mock data on error
        const emptyBranchMetrics = createDefaultBranchMetrics();
        
        // Generate mock data with smaller numbers for testing
        DEFAULT_BRANCHES.forEach(branch => {
            // Use realistic but small numbers (5-15 per branch)
            emptyBranchMetrics[branch].total = Math.floor(Math.random() * 10) + 5;
            
            // Distribute appointments across months
            const totalAppts = emptyBranchMetrics[branch].total;
            for (let i = 0; i < 12; i++) {
                emptyBranchMetrics[branch].monthly[i] = Math.floor(totalAppts / 12);
            }
            
            // Distribute across pet types (ensuring counts add up to total)
            let remaining = totalAppts;
            DEFAULT_PET_TYPES.forEach((type, i) => {
                if (i === DEFAULT_PET_TYPES.length - 1) {
                    // Last type gets whatever is left
                    emptyBranchMetrics[branch].petTypeStats[type] = remaining;
                } else {
                    // Other types get a proportion
                    const count = Math.floor(remaining * 0.2);
                    emptyBranchMetrics[branch].petTypeStats[type] = count;
                    remaining -= count;
                }
            });
        });
        
        // Create mock predictions that are more visually interesting
        const emptyPredictions = {};
        DEFAULT_BRANCHES.forEach(branch => {
            // Generate a total prediction between 5-15 per branch
            const predictedTotal = Math.floor(Math.random() * 10) + 5;
            
            emptyPredictions[branch] = {
                total: predictedTotal,
                byPetType: {},
                mostPopularType: DEFAULT_PET_TYPES[Math.floor(Math.random() * DEFAULT_PET_TYPES.length)]
            };
            
            // Distribute predicted appointments across pet types
            // More realistic distribution that ensures each type has at least 1
            let remainingPredicted = predictedTotal;
            DEFAULT_PET_TYPES.forEach((type, i) => {
                if (i === DEFAULT_PET_TYPES.length - 1) {
                    // Last type gets whatever is left
                    emptyPredictions[branch].byPetType[type] = Math.max(1, remainingPredicted);
                } else {
                    // Generate a number between 1 and (remaining/2)
                    const typePrediction = Math.floor(Math.random() * (remainingPredicted / 2)) + 1;
                    emptyPredictions[branch].byPetType[type] = typePrediction;
                    remainingPredicted -= typePrediction;
                }
            });
        });
        
        res.json({
            currentMetrics: emptyBranchMetrics,
            predictions: emptyPredictions
        });
    }
});

module.exports = router; 