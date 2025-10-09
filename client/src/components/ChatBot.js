import React, { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your MarsaFyi assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getChatbotResponse = async (userInput, conversationHistory) => {
    try {
      // Prepare the conversation history for the API
      const history = conversationHistory
        .filter(msg => msg.id !== 1) // Exclude the initial greeting
        .map(msg => ({
          text: msg.text,
          sender: msg.sender
        }));

      // Call the chatbot API endpoint
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userInput,
          history: history
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the response text
      if (data.response) {
        return data.response;
      } else {
        throw new Error('No response content found');
      }
    } catch (error) {
      console.error('Chatbot API error:', error);
      // Fallback to rule-based responses if API fails
      return getFallbackResponse(userInput);
    }
  };

  const getFallbackResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('register') || lowerInput.includes('sign up') || lowerInput.includes('create account')) {
      return "To register on MarsaFyi, click the 'Join/Login' button at the top right corner of the homepage. You'll need to provide your business details, contact information, and create a secure password. After registration, you'll receive a confirmation email to verify your account. Different roles are available including buyer, seller, captain, and more.";
    }
    else if (lowerInput.includes('login') || lowerInput.includes('sign in') || lowerInput.includes('password')) {
      return "To login, click the 'Join/Login' button at the top right corner and enter your registered email and password. If you've forgotten your password, click 'Forgot Password' to reset it via email. Remember that this is a B2B platform, so business credentials are required.";
    }
    else if (lowerInput.includes('buy') || lowerInput.includes('purchase') || lowerInput.includes('rfq') || lowerInput.includes('request quote')) {
      return "To buy products on MarsaFyi, browse our catalog or search for specific items. When you find what you need, click 'Request Quote' to submit an RFQ to suppliers. You can compare quotes from multiple verified suppliers and choose the best offer. All suppliers go through KYC verification for your protection.";
    }
    else if (lowerInput.includes('sell') || lowerInput.includes('supplier') || lowerInput.includes('vendor') || lowerInput.includes('product listing')) {
      return "To sell on MarsaFyi, you need to register as a supplier. After registration, you can list your products by providing detailed descriptions, images, and pricing. Our verification team will review your products and business credentials before they go live. This ensures trust and quality for all buyers.";
    }
    else if (lowerInput.includes('about') || lowerInput.includes('what is') || lowerInput.includes('platform')) {
      return "MarsaFyi is a port-centric B2B marketplace that connects global businesses. We specialize in trade solutions, supplier verification, customs clearance, and logistics services. Our platform helps businesses scale their international trade operations with trusted partnerships across continents.";
    }
    else if (lowerInput.includes('contact') || lowerInput.includes('support') || lowerInput.includes('help')) {
      return "You can reach our support team by clicking the 'Contact' link in the footer or by emailing support@marsafyi.com. Our team is available to assist you with platform queries. Please note that I can only provide general information and cannot access personal account details.";
    }
    else if (lowerInput.includes('logistics') || lowerInput.includes('shipping') || lowerInput.includes('customs')) {
      return "MarsaFyi offers integrated logistics and shipping services with real-time tracking. We also provide customs clearance assistance with documentation and advisory services. Our platform connects you with verified logistics partners to ensure smooth delivery of your goods.";
    }
    else if (lowerInput.includes('verification') || lowerInput.includes('kyc') || lowerInput.includes('audit')) {
      return "All suppliers on MarsaFyi go through KYC (Know Your Customer) verification and audits. This includes document verification, business validation, and quality checks. This process ensures that buyers can trust the suppliers they're working with and helps maintain the quality of our marketplace.";
    }
    else {
      return "I can help you with registration, login, buying, selling, and other platform features on MarsaFyi. For specific questions about your account or personal data, please contact our support team at support@marsafyi.com as I don't have access to personal information. What would you like to know more about?";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get response from chatbot API
      const response = await getChatbotResponse(inputValue, messages);
      
      const botMessage = {
        id: messages.length + 2,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Chatbot button */}
      <div 
        className="w-14 h-14 rounded-full shadow-lg cursor-pointer flex items-center justify-center mb-3"
        onClick={toggleChat}
        style={{ 
          backgroundColor: '#f77f00',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="white"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          <path d="M6 12h12M6 8h12M6 16h8"/>
        </svg>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div 
          className="w-80 rounded-xl shadow-xl flex flex-col"
          style={{ 
            backgroundColor: '#fff',
            border: '1px solid #f6efe6',
            height: '500px'
          }}
        >
          {/* Chat header */}
          <div 
            className="p-4 rounded-t-xl flex justify-between items-center"
            style={{ backgroundColor: '#f77f00' }}
          >
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="white"
                className="mr-2"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
              <h3 className="font-bold text-white">MarsaFyi Assistant</h3>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#f9f9f9' }}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-orange-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <div className="text-sm">{message.text}</div>
                  <div 
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 rounded-l border border-r-0 border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-r bg-orange-500 text-white hover:bg-orange-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              I can help with registration, login, buying, and selling
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;