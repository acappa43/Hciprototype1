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

  // const simulateBotResponse = (userMessage: string): string => {
  //   const activeSources = sources.filter(s => s.checked);
    
  //   if (activeSources.length === 0) {
  //     return "I need active sources to answer that! Please select documents from the left sidebar.";
  //   }

  //   const lowerMessage = userMessage.toLowerCase();

  //   // Simple keyword-based responses based on source content
  //   if (lowerMessage.includes('exam') || lowerMessage.includes('test')) {
  //     const syllabusSource = activeSources.find(s => s.type === 'Syllabus');
  //     if (syllabusSource) {
  //       return "According to the Course Syllabus, the exam date is 11/30. The grading breakdown is: Essay (40%), Quiz (30%), and Participation (30%).";
  //     }
  //   }

  //   if (lowerMessage.includes('estate') || lowerMessage.includes('estates-general')) {
  //     return "The Estates-General was an assembly representing the three estates of French society. It last met in 1614 before being convened again in 1789, which was a key trigger for the French Revolution.";
  //   }

  //   if (lowerMessage.includes('national assembly')) {
  //     return "The National Assembly was formed by representatives of the Third Estate. It's considered the first formal act of the revolution and marked a direct challenge to the Monarchy and Estates-General system.";
  //   }

  //   if (lowerMessage.includes('terror') || lowerMessage.includes('reign of terror')) {
  //     return "The Reign of Terror was a period of state-sanctioned violence and mass executions that occurred from September 1793 to July 1794 during the French Revolution.";
  //   }

  //   if (lowerMessage.includes('cause') || lowerMessage.includes('debt') || lowerMessage.includes('war')) {
  //     return "A primary cause of the French Revolution was the massive war debt from the Seven Years' War and the American Revolution, which created severe financial pressures on the French government.";
  //   }

  //   if (lowerMessage.includes('grading') || lowerMessage.includes('grade')) {
  //     const syllabusSource = activeSources.find(s => s.type === 'Syllabus');
  //     if (syllabusSource) {
  //       return "According to your syllabus, the grading structure is: Essay (40%), Quiz (30%), and Participation (30%).";
  //     }
  //   }

  //   // Default response
  //   return `Based on your ${activeSources.length} active source${activeSources.length > 1 ? 's' : ''}, I found information related to your question. The documents cover key aspects of the French Revolution including the Estates-General, National Assembly, causes of the revolution, and important dates. Could you be more specific about what you'd like to know?`;
  // };

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: trimmedInput }]);
    setInput('');
    setIsLoading(true);

    try {
      Model.response(trimmedInput)
        .then((botResponse) => {
          setMessages(prev => [...prev, { sender: 'bot', text: botResponse ?? '' }]);
        })
        .catch((error) => {
          setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong while fetching the response.' }]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong while fetching the response.' }]);
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
