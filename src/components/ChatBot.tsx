// src/components/ChatBot.tsx
import React, { useState } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your Walters Opticians assistant. Need help understanding your prescription or picking frames?',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Rule-based assistance response
    setTimeout(() => {
      let botReply = "I'm here to help! For exact prescription validation, you can upload your prescription file directly during checkout.";
      const query = input.toLowerCase();

      if (query.includes('pd') || query.includes('pupillary')) {
        botReply = 'Pupillary Distance (PD) is the distance between the centers of your pupils in millimeters. Average adult PD ranges between 54–74 mm.';
      } else if (query.includes('sph') || query.includes('sphere')) {
        botReply = 'Sphere (SPH) indicates lens power. A minus (-) sign indicates nearsightedness, while a plus (+) sign indicates farsightedness.';
      } else if (query.includes('size') || query.includes('fit')) {
        botReply = 'Check the inside temple arm of your current glasses for three numbers (e.g., 52-18-140) representing lens width, bridge width, and temple length.';
      }

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#021438] text-[#FBFAF5] p-4 rounded-full shadow-2xl hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center gap-2"
        >
          <span className="font-bold text-sm">Optical AI</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-80 sm:w-96 flex flex-col h-[480px]">
          {/* Header */}
          <div className="p-4 bg-[#021438] text-white rounded-t-2xl flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#FBFAF5]">Walters Optical Assistant</h3>
              <p className="text-[10px] text-[#E5E0D8]">Online • Instant Guidance</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#E6AA38] font-bold">
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-xl p-3 text-xs ${
                  m.sender === 'user'
                    ? 'ml-auto bg-[#021438] text-[#FBFAF5]'
                    : 'bg-white border border-[#E5E0D8] text-[#021438]'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#E5E0D8] flex gap-2 bg-white rounded-b-2xl">
            <input
              type="text"
              placeholder="Ask about PD, SPH, or sizing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#021438]"
            />
            <button type="submit" className="bg-[#021438] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#E6AA38] hover:text-[#021438]">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};