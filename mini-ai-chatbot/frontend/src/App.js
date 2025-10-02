import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Custom Hook for the typing effect
const useTypingEffect = (text, duration) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (text) {
      let i = 0;
      setDisplayedText(''); // Reset text when new text comes in
      const intervalId = setInterval(() => {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
        if (i > text.length) {
          clearInterval(intervalId);
        }
      }, duration);

      return () => clearInterval(intervalId);
    }
  }, [text, duration]);

  return displayedText;
};

// New Component for rendering each chat message
const ChatMessage = ({ message, isLastBotMessage }) => {
  const isBot = message.type === 'bot';
  // If it's the last bot message, apply the typing effect. Otherwise, show the full message.
  const displayText = isBot && isLastBotMessage ? useTypingEffect(message.message, 50) : message.message;

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
        {/* Show blinking cursor only when typing */}
        {isBot && isLastBotMessage && displayText.length < message.message.length && <span className="typing-cursor"></span>}
      </div>
    </div>
  );
};

function App() {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]); // Scrolls whenever history changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { type: 'user', message: input };
    setChatHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // *** THIS IS THE UPDATED LINE FOR DEPLOYMENT ***
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
              // Pass a prop to identify the very last bot message for the typing effect
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