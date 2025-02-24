const handleChatbotQuery = async (req, res) => {
    try {
        const { message } = req.body;
        const isAuthenticated = req.user != null;

        // Basic response mapping for common queries
        const responses = {
            // Pet care related responses
            appointment: "To schedule an appointment, please go to the Appointments tab and click on 'New Appointment'. You can choose your preferred date and time there.",
            emergency: "If you have a pet emergency, please call our emergency hotline immediately at [YOUR-EMERGENCY-NUMBER] or visit the nearest veterinary emergency room.",
            hours: "Our regular business hours are Monday to Friday 9 AM to 6 PM, and Saturday 10 AM to 4 PM. We are closed on Sundays.",
            services: "We offer a comprehensive range of pet care services including:\n• Regular check-ups and vaccinations\n• Grooming and bathing\n• Dental care\n• Emergency services\n• Pet boarding\n• Behavioral training\n• Nutritional counseling\nYou can book any of these services through our appointment system.",
            location: "You can find our location and contact details in the Contact section of the website.",
            
            // General conversation responses
            greeting: "Hello! I'm here to help you with any questions about pets or our services. How can I assist you today?",
            thanks: "You're welcome! Is there anything else I can help you with?",
            goodbye: "Thank you for chatting with me! Have a great day!",
            
            // Off-topic responses
            weather: "While I'm primarily focused on pet care, I understand you're asking about the weather. For accurate weather information, I'd recommend checking a weather service or app.",
            movies: "While I'm specialized in pet care, there are many great entertainment websites and apps that can help you with movie recommendations!",
            food: "Although I'm focused on pet care, if you're looking for food recommendations or restaurants, I'd suggest checking local review sites or food apps.",
            
            // Fallback responses
            default: "I'm here to help you with any questions about pets and our services. While I might not be able to help with all topics, I'll do my best to assist or direct you to the right resources.",
            unclear: "I'm not quite sure I understood that. Could you rephrase your question? I'm best at answering questions about pets, pet care, and our services."
        };

        // Function to analyze message and return all relevant responses
        const analyzeMessage = (message) => {
            const lowercaseMessage = message.toLowerCase();
            let responseComponents = [];
            let hasGreeting = false;
            let hasQuestion = false;

            // Check for greetings
            if (lowercaseMessage.match(/^(hi|hello|hey|greetings)/i)) {
                responseComponents.push(responses.greeting);
                hasGreeting = true;
            }

            // Check for services
            if (lowercaseMessage.includes('service') || lowercaseMessage.includes('offer') || 
                lowercaseMessage.includes('provide') || lowercaseMessage.includes('what') || 
                lowercaseMessage.includes('available')) {
                responseComponents.push(responses.services);
                hasQuestion = true;
            }

            // Check for appointments
            if (lowercaseMessage.includes('appointment') || lowercaseMessage.includes('schedule') || 
                lowercaseMessage.includes('book')) {
                responseComponents.push(responses.appointment);
                hasQuestion = true;
            }

            // Check for hours
            if (lowercaseMessage.includes('hour') || lowercaseMessage.includes('time') || 
                lowercaseMessage.includes('open')) {
                responseComponents.push(responses.hours);
                hasQuestion = true;
            }

            // Check for location
            if (lowercaseMessage.includes('location') || lowercaseMessage.includes('address') || 
                lowercaseMessage.includes('where')) {
                responseComponents.push(responses.location);
                hasQuestion = true;
            }

            // Check for emergency
            if (lowercaseMessage.includes('emergency') || lowercaseMessage.includes('urgent') || 
                lowercaseMessage.includes('help')) {
                responseComponents.push(responses.emergency);
                hasQuestion = true;
            }

            // Check for thanks
            if (lowercaseMessage.match(/(thanks|thank you|thx)/i)) {
                responseComponents.push(responses.thanks);
                hasQuestion = true;
            }

            // Check for goodbye
            if (lowercaseMessage.match(/(bye|goodbye|see you)/i)) {
                responseComponents.push(responses.goodbye);
                hasQuestion = true;
            }

            // Check for off-topic queries
            if (lowercaseMessage.includes('weather')) {
                responseComponents.push(responses.weather);
                hasQuestion = true;
            }
            if (lowercaseMessage.includes('movie') || lowercaseMessage.includes('film') || 
                lowercaseMessage.includes('cinema')) {
                responseComponents.push(responses.movies);
                hasQuestion = true;
            }
            if (lowercaseMessage.includes('food') || lowercaseMessage.includes('restaurant') || 
                lowercaseMessage.includes('eat')) {
                responseComponents.push(responses.food);
                hasQuestion = true;
            }

            // If no specific matches were found
            if (!hasQuestion && !hasGreeting) {
                responseComponents.push(responses.unclear);
            }

            // Combine responses intelligently
            return responseComponents
                .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
                .join('\n\n');
        };

        // Add a small delay to make the interaction feel more natural
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = analyzeMessage(message);
        res.json({ response });
    } catch (error) {
        console.error('Chatbot Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    handleChatbotQuery
};
