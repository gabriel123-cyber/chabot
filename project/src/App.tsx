import React, { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ChatSidebar } from './components/ChatSidebar';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { ErrorMessage } from './components/ErrorMessage';
import { useGPT4Free } from './hooks/useGPT4Free';
import { useChatStorage } from './hooks/useChatStorage';
import { Message, AIModel } from './types/chat';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4.1');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isLoading: clientLoading, error: clientError, sendMessage } = useGPT4Free();
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    addMessage,
    deleteSession,
    getCurrentSession,
  } = useChatStorage();

  const currentSession = getCurrentSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isTyping]);

  const handleSendMessage = async (content: string, model: AIModel) => {
    let sessionId = currentSessionId;
    
    if (!sessionId) {
      sessionId = createNewSession();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    addMessage(sessionId, userMessage);
    setIsTyping(true);

    try {
      const messages = [
        ...currentSession?.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })) || [],
        { role: 'user', content },
      ];

      const response = await sendMessage(messages, model);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        model,
      };

      addMessage(sessionId, assistantMessage);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
        model,
      };

      addMessage(sessionId, errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    createNewSession();
  };

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI client...</p>
        </div>
      </div>
    );
  }

  if (clientError) {
    return (
      <div className="min-h-screen bg-gray-100">
        <ErrorMessage message={clientError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={deleteSession}
        isCollapsed={isSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
            <h1 className="text-xl font-semibold text-gray-900">GPT4Free Chat</h1>
          </div>
          
          <div className="text-sm text-gray-500">
            {currentSession?.messages.length || 0} messages
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to GPT4Free Chat
                </h2>
                <p className="text-gray-600 mb-6">
                  Start a conversation with AI. Choose from multiple models including O3, O4 Mini, GPT-4.1, GPT-4o, and Gemini 2.5 Pro.
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {currentSession.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isTyping}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>
    </div>
  );
}

export default App;