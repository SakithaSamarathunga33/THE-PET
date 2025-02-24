import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiSmile, FiPaperclip } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm Buddy, your PetCare assistant. How can I help you today? 🐾", 
      isBot: true 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [suggestions] = useState([
    "What services do you offer?",
    "How much is grooming?",
    "Book an appointment",
    "Emergency services",
    "Opening hours"
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = { text: inputMessage, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await response.json();
      
      // Add bot response
      setMessages(prev => [...prev, { text: data.response, isBot: true }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        isBot: true 
      }]);
    }

    setIsLoading(false);
  };

  // Add quick reply function
  const handleQuickReply = (suggestion) => {
    setInputMessage(suggestion);
    handleSendMessage({ preventDefault: () => {} });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group bg-gradient-to-r from-[#4DB6AC] to-[#26A69A] hover:from-[#26A69A] hover:to-[#4DB6AC] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl flex items-center gap-2"
        >
          <MdPets size={24} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-sm font-medium hidden group-hover:inline">Chat with Buddy</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col animate-fade-in">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#4DB6AC] to-[#26A69A] text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <MdPets className="w-6 h-6 text-[#26A69A]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Buddy</h3>
                <p className="text-xs text-teal-100">Your PetCare Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Enhanced Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-teal-50/50 to-white">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} items-end gap-2`}
                >
                  {message.isBot && (
                    <div className="bg-teal-500 rounded-full p-1.5 mb-1">
                      <MdPets className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-3 max-w-[80%] ${
                      message.isBot
                        ? 'bg-white shadow-md text-gray-800'
                        : 'bg-gradient-to-r from-[#4DB6AC] to-[#26A69A] text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-end gap-2">
                  <div className="bg-teal-500 rounded-full p-1.5 mb-1">
                    <MdPets className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white shadow-md rounded-2xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="p-2 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(suggestion)}
                  className="text-xs bg-white border border-teal-200 text-teal-600 px-3 py-1.5 rounded-full hover:bg-teal-50 transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Chat Input */}
          <div className="p-4 bg-white rounded-b-2xl border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-[#4DB6AC] to-[#26A69A] hover:from-[#26A69A] hover:to-[#4DB6AC] text-white rounded-full p-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              >
                <FiSend size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
