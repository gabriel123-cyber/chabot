import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { AIModel } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (message: string, model: AIModel) => void;
  isLoading: boolean;
  onStop?: () => void;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

const models: { value: AIModel; label: string; color: string }[] = [
  { value: 'o3', label: 'O3', color: 'bg-red-500' },
  { value: 'o4-mini', label: 'O4 Mini', color: 'bg-orange-500' },
  { value: 'gpt-4.1', label: 'GPT-4.1', color: 'bg-green-500' },
  { value: 'gpt-4o', label: 'GPT-4o', color: 'bg-blue-500' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', color: 'bg-purple-500' },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStop,
  selectedModel,
  onModelChange,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), selectedModel);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">Model:</span>
          <div className="flex gap-2 flex-wrap">
            {models.map((model) => (
              <button
                key={model.value}
                onClick={() => onModelChange(model.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedModel === model.value
                    ? `${model.color} text-white`
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {model.label}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none max-h-32"
              rows={1}
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isLoading
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : message.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={isLoading ? onStop : undefined}
          >
            {isLoading ? (
              <>
                <Square size={18} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};