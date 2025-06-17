import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import useThemeStore from '../../store/themeStore';
import { WelcomeMessage } from './WelcomeMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Use your actual Gemini API key here
const genAI = new GoogleGenerativeAI('AIzaSyBAtURzURlHZMgueYjH1wfr4fGC928XRAw');
const GEMINI_MODEL = 'gemini-1.5-flash';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WelcomeMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useThemeStore();

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto focus on input
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Handle sending message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const prompt = `You are a helpful cryptocurrency and trading assistant. Please provide accurate and helpful information about: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const text =
        result?.response?.text?.() ||
        result?.response?.candidates?.[0]?.content ||
        "Sorry, couldn't get a response.";

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error: any) {
      console.error('Error generating response:', error);
      let errMsg = 'I apologize, but I encountered an error. Please try again.';
      if (
        error.message &&
        error.message.includes('not found for API version')
      ) {
        errMsg = `Sorry, this chatbot's model is currently unavailable. Please check your API key or model name.`;
      }
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: errMsg }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter for send, Shift+Enter for new line (if using textarea)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 flex items-center space-x-2"
          title="Open Chatbot"
        >
          <Bot className="w-6 h-6" />
        </button>
      ) : (
        <div
          className={`${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-xl w-96 h-[600px] flex flex-col border ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div
            className={`p-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            } rounded-t-lg flex justify-between items-center border-b ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bot
                className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              />
              <h3
                className={`font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Crypto Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1.5 rounded-full ${
                theme === 'dark'
                  ? 'hover:bg-gray-600 text-gray-300'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Close Chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-gray-100 text-gray-900'
                  } shadow-sm`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            className={`p-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            } rounded-b-lg border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about crypto..."
                className={`flex-1 rounded-lg px-4 py-2.5 ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-600'
                    : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                ref={inputRef}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`p-2.5 rounded-lg ${
                  isLoading || !input.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors flex items-center justify-center`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
