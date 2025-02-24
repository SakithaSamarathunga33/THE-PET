const Employee = require("../models/Employee");

// Add new employee
exports.addEmployee = async (req, res) => {
    try {
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json({ message: "Employee added successfully", employee });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all employees
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update employee
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Handle salary update
        if (updateData.calculatedSalary !== undefined) {
            employee.calculatedSalary = updateData.calculatedSalary;
        } else {
            // Handle other updates
            Object.assign(employee, updateData);
        }

        await employee.save();
        res.status(200).json({ 
            message: "Employee updated successfully", 
            employee 
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ error: error.message });
    }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Record attendance
exports.recordAttendance = async (req, res) => {
    try {
        const { employeeId, date, present, checkIn, checkOut } = req.body;
        const employee = await Employee.findById(employeeId);
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        let hoursWorked = 0;
        if (checkIn && checkOut) {
            const checkInTime = new Date(checkIn);
            const checkOutTime = new Date(checkOut);
            hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        }

        const attendance = {
            date: new Date(date),
            present,
            checkIn: checkIn ? new Date(checkIn) : null,
            checkOut: checkOut ? new Date(checkOut) : null,
            hoursWorked
        };

        employee.attendance.push(attendance);
        await employee.save();

        res.status(200).json({ message: "Attendance recorded successfully", attendance });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Apply for leave
exports.applyLeave = async (req, res) => {
    try {
        const { employeeId, type, startDate, endDate, paid } = req.body;
        const employee = await Employee.findById(employeeId);
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const leave = {
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            paid: paid !== undefined ? paid : true,
            approved: false
        };

        employee.leaves.push(leave);
        await employee.save();

        res.status(200).json({ message: "Leave application submitted successfully", leave });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Approve/Reject leave
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { employeeId, leaveId, approved } = req.body;
        const employee = await Employee.findById(employeeId);
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const leave = employee.leaves.id(leaveId);
        if (!leave) {
            return res.status(404).json({ message: "Leave application not found" });
        }

        leave.approved = approved;
        if (approved) {
            employee.status = 'On Leave';
        }

        await employee.save();

        res.status(200).json({ 
            message: `Leave ${approved ? 'approved' : 'rejected'} successfully`, 
            leave 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Record overtime
exports.recordOvertime = async (req, res) => {
    try {
        const { employeeId, date, hours, rate } = req.body;
        const employee = await Employee.findById(employeeId);
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const overtime = {
            date: new Date(date),
            hours,
            rate: rate || 1.5,
            approved: false
        };

        employee.overtime.push(overtime);
        await employee.save();

        res.status(200).json({ message: "Overtime recorded successfully", overtime });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Approve/Reject overtime
exports.updateOvertimeStatus = async (req, res) => {
    try {
        const { employeeId, overtimeId, approved } = req.body;
        const employee = await Employee.findById(employeeId);
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const overtime = employee.overtime.id(overtimeId);
        if (!overtime) {
            return res.status(404).json({ message: "Overtime record not found" });
        }

        overtime.approved = approved;
        await employee.save();

        res.status(200).json({ 
            message: `Overtime ${approved ? 'approved' : 'rejected'} successfully`, 
            overtime 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get monthly salary
exports.getMonthlySalary = async (req, res) => {
    try {
        const { employeeId, month, year } = req.params;
        const employee = await Employee.findById(employeeId);
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Get the virtual monthlySalary
        const salary = employee.monthlySalary;

        // Get detailed breakdown
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const approvedLeaves = employee.leaves.filter(leave => 
            leave.approved && 
            leave.startDate >= startDate && 
            leave.endDate <= endDate
        );

        const approvedOvertime = employee.overtime.filter(ot => 
            ot.approved && 
            ot.date >= startDate && 
            ot.date <= endDate
        );

        const attendance = employee.attendance.filter(att => 
            att.date >= startDate && 
            att.date <= endDate
        );

        res.status(200).json({
            employeeName: employee.name,
            month: month,
            year: year,
            baseSalary: employee.baseSalary,
            totalSalary: salary,
            breakdown: {
                leaves: approvedLeaves,
                overtime: approvedOvertime,
                attendance: attendance
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};