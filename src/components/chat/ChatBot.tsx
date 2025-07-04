import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import useThemeStore from '../../store/themeStore';
import { WelcomeMessage } from './WelcomeMessage';
import { getCoinPrice, getCoinIdFromSymbol } from '../../services/api/coinGecko';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const genAI = new GoogleGenerativeAI('AIzaSyBAtURzURlHZMgueYjH1wfr4fGC928XRAw');
const GEMINI_MODEL = 'gemini-1.5-flash';

function cleanGeminiAnswer(text: string) {
  let cleaned = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/^- /gm, "")
    .replace(/[_#]/g, "")
    .replace(/\n\s*\*/g, "\n")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{2,}/g, "\n\n");

  cleaned = cleaned.replace(/This information is for educational purposes only[\s\S]*?(?=\n|$)/gi, "");
  cleaned = cleaned.replace(/I cannot provide the exact, real-time price of [\s\S]*?(?=\n|$)/gi, "");
  cleaned = cleaned.replace(/As an AI language model[\s\S]*?(?=\n|$)/gi, "");
  cleaned = cleaned.replace(/Always do your own research[\s\S]*?(?=\n|$)/gi, "");
  cleaned = cleaned.replace(/Please specify what you'd like to know[\s\S]*?(?=\n|$)/gi, "");
  cleaned = cleaned.replace(/To find the current price of[\s\S]*?(?=\n|$)/gi, "");
  cleaned = cleaned.replace(/For financial advice[\s\S]*?(?=\n|$)/gi, "");
  cleaned = cleaned.replace(/CoinMarketCap|CoinGecko|Binance|Kraken|Bitfinex/gi, "");
  cleaned = cleaned.replace(/I (?:apologize|cannot|don't|do not|can't)[^.]*\./gi, "");

  const paragraphs = cleaned.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return paragraphs[0] || cleaned.trim();
}

const extractCoinFromQuery = (query: string): string | null => {
  const lowerQuery = query.toLowerCase();
  const priceKeywords = ['price', 'cost', 'value', 'worth', 'trading at', 'current', 'how much'];
  const hasPriceKeyword = priceKeywords.some(keyword => lowerQuery.includes(keyword));
  
  if (!hasPriceKeyword) return null;

  // Common patterns for crypto mentions
  const patterns = [
    /(?:bitcoin|btc)/i,
    /(?:ethereum|eth)/i,
    /(?:cardano|ada)/i,
    /(?:polkadot|dot)/i,
    /(?:chainlink|link)/i,
    /(?:litecoin|ltc)/i,
    /(?:binance coin|bnb)/i,
    /(?:solana|sol)/i,
    /(?:dogecoin|doge)/i,
    /(?:avalanche|avax)/i,
  ];

  for (const pattern of patterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WelcomeMessage, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      // Check if user is asking for crypto price
      const coinSymbol = extractCoinFromQuery(userMessage);
      let priceInfo = '';
      
      if (coinSymbol) {
        try {
          const coinId = getCoinIdFromSymbol(coinSymbol);
          const priceData = await getCoinPrice(coinId);
          
          if (priceData) {
            const changeDirection = priceData.price_change_percentage_24h >= 0 ? '📈' : '📉';
            priceInfo = `\n\n💰 Current ${coinSymbol.toUpperCase()} Price: $${priceData.current_price.toLocaleString()} ${changeDirection}\n24h Change: ${priceData.price_change_percentage_24h.toFixed(2)}%\nMarket Cap: $${(priceData.market_cap / 1e9).toFixed(2)}B\n(Source: CoinGecko API - Real-time data)`;
          }
        } catch (priceError) {
          console.error('Error fetching price:', priceError);
          priceInfo = `\n\n⚠️ Unable to fetch current ${coinSymbol.toUpperCase()} price at the moment. Please try again later.`;
        }
      }

      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const prompt = `You are a helpful cryptocurrency and trading assistant for CryptoTrade platform. Provide concise, accurate, and helpful information about: ${userMessage}. Keep responses brief and actionable. Focus on practical trading advice and market insights. If asked about prices, mention that real-time price data is provided separately.`;
      
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.() || "Sorry, couldn't get a response.";
      const cleanText = cleanGeminiAnswer(text);
      
      const finalResponse = cleanText + priceInfo;

      setMessages(prev => [...prev, { role: 'assistant', content: finalResponse, timestamp: new Date() }]);
    } catch (error: any) {
      console.error('Error generating response:', error);
      let errMsg = 'I apologize, but I encountered an error. Please try again.';
      if (error.message && error.message.includes('not found for API version')) {
        errMsg = `Sorry, this chatbot's model is currently unavailable. Please check your API key or model name.`;
      }
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: errMsg, timestamp: new Date() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full p-4 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 animate-bounce-gentle"
          size="lg"
        >
          <Bot className="w-6 h-6" />
          <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 ${isMinimized ? 'h-16' : 'h-[600px]'} flex flex-col transition-all duration-300 shadow-2xl backdrop-blur-lg`}>
        {/* Header */}
        <div className={`p-4 ${
          theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-gray-50 to-gray-100'
        } rounded-t-2xl flex justify-between items-center border-b ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Crypto Assistant
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Real-time prices & insights
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-600 text-gray-300'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-600 text-gray-300'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-blue-50/20">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl p-4 shadow-md ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-200 border border-gray-600'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                      <p className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-blue-100' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-white border border-gray-200'
                  } shadow-md`}>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200"></div>
                      </div>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Fetching real-time data...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            } rounded-b-2xl border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about crypto prices, trading tips, or market trends..."
                  className={`flex-1 rounded-xl px-4 py-3 text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-600'
                      : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  ref={inputRef}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl px-4 py-3"
                  variant="primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                💡 Try: "What's the Bitcoin price?" or "ETH trading analysis"
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;