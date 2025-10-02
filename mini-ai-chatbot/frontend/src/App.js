import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Custom Hook for the typing effect
const useTypingEffect = (text, duration) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (text) {
      let i = 0;
      setDisplayedText('');
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, duration);

      return () => clearInterval(intervalId);
    }
  }, [text, duration]);

  return displayedText;
};

// Component for rendering each chat message
const ChatMessage = ({ message, isLastBotMessage }) => {
  const isBot = message.type === 'bot';
  
  // FIX 1: The Hook is now called unconditionally at the top.
  const typedMessage = useTypingEffect(message.message, 40);
  
  // The RESULT of the Hook is then used conditionally.
  const displayText = isBot && isLastBotMessage ? typedMessage : message.message;
  
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className={`message-wrapper ${message.type}`}>
      {isBot && (
        <div className="bot-avatar">
          <div className="bot-avatar-eye"></div>
          <div className="bot-avatar-eye"></div>
        </div>
      )}
      <div className={`message ${message.type}`}>
        {displayText}
        {isBot && isLastBotMessage && displayText.length < message.message.length && <span className="typing-cursor"></span>}
        
        {isBot && (!isLastBotMessage || displayText.length === message.message.length) && (
          <button onClick={handleCopy} className="copy-btn">
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
};

function App() {
  const [input, setInput] = useState('');
  
  // FIX 2: Welcome message logic is now combined with the localStorage logic.
  const [chatHistory, setChatHistory] = useState(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    const initialHistory = savedHistory ? JSON.parse(savedHistory) : [];
    
    if (initialHistory.length === 0) {
      return [{ type: 'bot', message: 'Hello! I am your AI Assistant. How can I help you with your professional questions today?' }];
    }
    return initialHistory;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // The problematic useEffect for the welcome message is no longer needed.

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { type: 'user', message: input };
    setChatHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://mini-ai-chatbot-backend.onrender.com/ask', {
        question: input,
      });
      const botMessage = { type: 'bot', message: response.data.answer };
      setChatHistory(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = { type: 'bot', message: 'Sorry, something went wrong. Please try again.' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h1>AI Assistant</h1>
          <p>Your professional co-pilot</p>
        </div>
        <div className="chat-history">
          {chatHistory.map((item, index) => (
            <ChatMessage 
              key={index} 
              message={item}
              isLastBotMessage={item.type === 'bot' && index === chatHistory.length - 1} 
            />
          ))}
          <div ref={chatEndRef} />
        </div>
        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;