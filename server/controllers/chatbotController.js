const handleChatbotQuery = async (req, res) => {
    try {
        const { message } = req.body;
        const isAuthenticated = req.user != null;

        // Enhanced response variations
        const responseVariations = {
            greetings: [
                "Hello! I'm here to help you with your pet care needs. What can I do for you today? ",
                "Hi there! I'm your friendly pet care assistant. How may I assist you? ",
                "Welcome! I'm excited to help you with anything pet-related. What's on your mind? ",
                "Greetings! I'm your PetCare buddy. How can I make your day better? "
            ],
            services: [
                "We offer several pet care services including:\n• Veterinary check-ups and vaccinations\n• Professional grooming\n• Dental care\n• Emergency services\n• Pet boarding\n• Training programs\nWhich service would you like to know more about?",
                "Our comprehensive pet care services cover:\n• Health check-ups\n• Grooming services\n• Dental health\n• 24/7 emergency care\n• Comfortable boarding\n• Expert training\nI'd be happy to provide more details about any of these!",
                "We're equipped to handle all your pet care needs with services like:\n• Medical check-ups\n• Grooming and styling\n• Dental procedures\n• Emergency support\n• Cozy boarding facilities\n• Behavioral training\nWhat interests you most?"
            ],
            appointments: [
                "I can help you schedule an appointment! Just head to the Appointments section and click 'New Appointment' to choose your preferred time slot.",
                "Booking an appointment is easy! Visit our Appointments page, select 'New Appointment', and pick a time that works for you.",
                "Need to schedule a visit? Go to the Appointments tab and click 'New Appointment' - you'll find our available time slots there."
            ],
            emergency: [
                "If you have a pet emergency, please call our 24/7 emergency hotline at [EMERGENCY-NUMBER] immediately. We're here to help!",
                "For emergencies, don't wait! Contact our emergency line at [EMERGENCY-NUMBER] right away. Every minute counts!",
                "Pet emergency? Call [EMERGENCY-NUMBER] now - our emergency team is available 24/7 to help your pet!"
            ],
            hours: [
                "We're open Monday-Friday (9 AM - 6 PM) and Saturday (10 AM - 4 PM). Closed on Sundays. Emergency services are always available!",
                "Our regular hours are: Mon-Fri 9 AM to 6 PM, Sat 10 AM to 4 PM. We're closed Sundays, but emergency care is available 24/7!",
                "Visit us Monday through Friday from 9 AM to 6 PM, or Saturday 10 AM to 4 PM. While we're closed Sundays, emergency care never stops!"
            ],
            thanks: [
                "You're welcome! Is there anything else you'd like to know about our pet care services?",
                "Happy to help! Don't hesitate to ask if you have more questions about pet care!",
                "My pleasure! Remember, I'm always here to help with your pet care questions!"
            ],
            goodbye: [
                "Thank you for chatting! Have a wonderful day with your furry friend! ",
                "Take care! Remember, we're always here for you and your pets! ",
                "Goodbye! Wishing you and your pet a fantastic day! "
            ],
            unclear: [
                "I'm not quite sure I understood. Could you rephrase that? I'm best at helping with pet-related questions!",
                "Hmm, I might need a bit more clarity. What specific pet care information are you looking for?",
                "I want to help, but I'm not sure I got that. Could you tell me more about what you need regarding pet care?"
            ],
            default: [
                "I specialize in pet care topics. While I might not know everything, I'll do my best to help or guide you to the right resources!",
                "As a pet care assistant, I can best help with questions about pets and our services. What would you like to know?",
                "I'm focused on helping with pet-related questions. How can I assist you with your pet care needs?"
            ],
            pricing: [
                "Here are our standard service prices:\n• Basic Check-up: $50\n• Grooming: $40-$80\n• Dental Cleaning: $100-$300\n• Vaccinations: $25-$50\n• Boarding: $35/day\n\nWould you like to book any of these services?",
                "Our current pricing structure:\n• Wellness Exam: $50\n• Pet Grooming: From $40\n• Dental Care: From $100\n• Vaccines: From $25\n• Boarding: $35 daily\n\nCan I help you schedule an appointment?"
            ],
            petCare: [
                "Here are some essential pet care tips:\n• Regular vet check-ups\n• Balanced diet\n• Daily exercise\n• Proper grooming\n• Dental hygiene\n• Updated vaccinations\n\nWould you like specific details about any of these?",
                "Important pet care guidelines:\n• Annual health checks\n• Nutritious meals\n• Regular exercise\n• Grooming routine\n• Dental care\n• Vaccination schedule\n\nNeed more information about these?"
            ],
            locations: [
                "Our main clinic is located at [ADDRESS]. We also have branches in:\n• North City\n• South Park\n• East Valley\n\nWhich location is most convenient for you?",
            ],
            insurance: [
                "We accept most pet insurance providers including:\n• PetPlan\n• Healthy Paws\n• Trupanion\n• ASPCA Pet Insurance\n\nWould you like information about our payment plans?",
            ]
        };

        // Helper function to get random response from variations
        const getRandomResponse = (responses) => {
            return responses[Math.floor(Math.random() * responses.length)];
        };

        // Enhanced message analysis
        const analyzeMessage = (message) => {
            const lowercaseMessage = message.toLowerCase();
            let responseComponents = [];
            let hasGreeting = false;
            let hasQuestion = false;

            // Expanded context tracking
            const context = {
                isQuestion: lowercaseMessage.includes('?'),
                mentionsService: lowercaseMessage.includes('service') || lowercaseMessage.includes('offer'),
                mentionsAppointment: lowercaseMessage.includes('appointment') || lowercaseMessage.includes('schedule'),
                mentionsEmergency: lowercaseMessage.includes('emergency') || lowercaseMessage.includes('urgent'),
                mentionsHours: lowercaseMessage.includes('hour') || lowercaseMessage.includes('open'),
                isGreeting: lowercaseMessage.match(/^(hi|hello|hey|greetings)/i) !== null,
                isThanks: lowercaseMessage.match(/(thanks|thank you|thx)/i) !== null,
                isGoodbye: lowercaseMessage.match(/(bye|goodbye|see you)/i) !== null,
                mentionsPricing: lowercaseMessage.includes('price') || lowercaseMessage.includes('cost') || lowercaseMessage.includes('fee'),
                mentionsPetCare: lowercaseMessage.includes('care') || lowercaseMessage.includes('tips') || lowercaseMessage.includes('advice'),
                mentionsLocation: lowercaseMessage.includes('where') || lowercaseMessage.includes('location') || lowercaseMessage.includes('address'),
                mentionsInsurance: lowercaseMessage.includes('insurance') || lowercaseMessage.includes('payment') || lowercaseMessage.includes('cover'),
                mentionsPets: lowercaseMessage.includes('dog') || lowercaseMessage.includes('cat') || lowercaseMessage.includes('pet')
            };

            // Enhanced response building
            if (context.mentionsPricing) {
                responseComponents.push(getRandomResponse(responseVariations.pricing));
            }

            if (context.mentionsPetCare) {
                responseComponents.push(getRandomResponse(responseVariations.petCare));
            }

            if (context.mentionsLocation) {
                responseComponents.push(getRandomResponse(responseVariations.locations));
            }

            if (context.mentionsInsurance) {
                responseComponents.push(getRandomResponse(responseVariations.insurance));
            }

            // Build response based on context
            if (context.isGreeting) {
                responseComponents.push(getRandomResponse(responseVariations.greetings));
                hasGreeting = true;
            }

            if (context.mentionsService) {
                responseComponents.push(getRandomResponse(responseVariations.services));
                hasQuestion = true;
            }

            if (context.mentionsAppointment) {
                responseComponents.push(getRandomResponse(responseVariations.appointments));
                hasQuestion = true;
            }

            if (context.mentionsEmergency) {
                responseComponents.push(getRandomResponse(responseVariations.emergency));
                hasQuestion = true;
            }

            if (context.mentionsHours) {
                responseComponents.push(getRandomResponse(responseVariations.hours));
                hasQuestion = true;
            }

            if (context.isThanks) {
                responseComponents.push(getRandomResponse(responseVariations.thanks));
                hasQuestion = true;
            }

            if (context.isGoodbye) {
                responseComponents.push(getRandomResponse(responseVariations.goodbye));
                hasQuestion = true;
            }

            // If no specific context was matched
            if (!hasGreeting && !hasQuestion) {
                if (context.isQuestion) {
                    responseComponents.push(getRandomResponse(responseVariations.unclear));
                } else {
                    responseComponents.push(getRandomResponse(responseVariations.default));
                }
            }

            return responseComponents.join('\n\n');
        };

        const response = analyzeMessage(message);
        res.json({ response });

    } catch (error) {
        console.error('Chatbot Error:', error);
        res.status(500).json({ 
            response: "I apologize, but I'm having trouble processing your request. Please try again or contact our support team." 
        });
    }
};

module.exports = {
    handleChatbotQuery
};
