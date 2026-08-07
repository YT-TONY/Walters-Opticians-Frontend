// src/components/ChatBot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Glasses, X, Send, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your Walters Opticians AI assistant. Need help understanding your prescription or picking frames?',
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Sends the user's message to your backend endpoint, which handles the Gemini API
      const response = await apiClient.post('/chat', { message: userText });
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.data.reply || "I'm here to help with your optical needs!",
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Chatbot API Error:", error);
      const errorReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Sorry, my connection to the server is currently down. Please try again later!",
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#021438] text-[#FBFAF5] p-4 rounded-full shadow-2xl hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center gap-2"
        >
          <Glasses className="w-6 h-6" />
          <span className="font-bold text-sm">Optical AI</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-80 sm:w-96 flex flex-col h-[480px]">
          {/* Header */}
          <div className="p-4 bg-[#021438] text-white rounded-t-2xl flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="bg-[#E6AA38] p-2 rounded-full text-[#021438]">
                <Glasses className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#FBFAF5]">Optical AI Assistant</h3>
                <p className="text-[10px] text-[#E5E0D8]">Powered by Gemini</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-[#E5E0D8] hover:text-[#E6AA38] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF8F5]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'ml-auto bg-[#021438] text-[#FBFAF5] rounded-br-sm'
                    : 'bg-white border border-[#E5E0D8] text-[#021438] rounded-bl-sm shadow-sm'
                }`}
              >
                {m.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white border border-[#E5E0D8] text-[#021438] rounded-2xl rounded-bl-sm p-3 max-w-[85%] shadow-sm flex items-center gap-2 w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-[#E6AA38]" />
                <span className="text-xs">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#E5E0D8] flex gap-2 bg-white rounded-b-2xl">
            <input
              type="text"
              placeholder="Ask about PD, SPH, or sizing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#021438] focus:ring-1 focus:ring-[#021438] disabled:opacity-50 transition-all"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-[#021438] text-white p-2.5 rounded-xl hover:bg-[#E6AA38] hover:text-[#021438] disabled:opacity-50 disabled:hover:bg-[#021438] disabled:hover:text-white transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};