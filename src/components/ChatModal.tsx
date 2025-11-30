import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import type { Source } from '../App';
import { Model } from './Model';

interface ChatModalProps {
  sources: Source[];
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  isLoading?: boolean;
}

export function ChatModal({ sources, onClose }: ChatModalProps) {

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I've analyzed your selected sources. Ask me anything about them, like \"When is the exam?\""
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: trimmedInput }]);
    setInput('');
    setIsLoading(true);

    // Use only checked and processed sources; fallback to plain response
    const selectedProcessed = sources
      .filter(s => s.checked && s.uploadStatus === 'processed')
      .map(s => ({ name: s.name, content: s.content }));

    try {
      const botResponse = selectedProcessed.length > 0
        ? await Model.generateWithSources(trimmedInput, selectedProcessed)
        : await Model.response(trimmedInput);

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse ?? '' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong while fetching the response.' }]);
      console.error('Model call error', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-20">
      <div className="bg-white w-full max-w-xl h-[80vh] flex flex-col p-6 rounded-xl shadow-2xl">
        <h3 className="text-[#10B981] mb-4">ChatBot</h3>
        
        <div
          ref={chatHistoryRef}
          className="flex-1 overflow-y-auto p-3 border border-gray-200 rounded-lg mb-4 space-y-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D5DB #F3F4F6'
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-xl max-w-xs md:max-w-md shadow-md ${
                  message.sender === 'user'
                    ? 'bg-[#4F46E5] text-white rounded-tr-none'
                    : 'bg-indigo-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-indigo-100 p-3 rounded-xl rounded-tl-none text-gray-800 max-w-xs md:max-w-md shadow-md flex items-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-[#4F46E5] focus:border-[#4F46E5] transition"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#10B981] text-white px-4 py-3 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Close Chat
          </button>
        </div>
      </div>
    </div>
  );
}
