import { useState, useEffect } from 'react';
import { ChatSession, Message } from '../types/chat';

const STORAGE_KEY = 'chatbot-sessions';

export const useChatStorage = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedSessions = JSON.parse(stored).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setSessions(parsedSessions);
      
      if (parsedSessions.length > 0 && !currentSessionId) {
        setCurrentSessionId(parsedSessions[0].id);
      }
    }
  }, [currentSessionId]);

  const saveToStorage = (updatedSessions: ChatSession[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedSessions = [newSession, ...sessions];
    saveToStorage(updatedSessions);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const addMessage = (sessionId: string, message: Message) => {
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
        const updatedMessages = [...session.messages, message];
        const title = session.messages.length === 0 && message.role === 'user' 
          ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
          : session.title;
        
        return {
          ...session,
          messages: updatedMessages,
          title,
          updatedAt: new Date(),
        };
      }
      return session;
    });

    saveToStorage(updatedSessions);
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    saveToStorage(updatedSessions);
    
    if (currentSessionId === sessionId) {
      setCurrentSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
    }
  };

  const getCurrentSession = () => {
    return sessions.find(s => s.id === currentSessionId) || null;
  };

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    addMessage,
    deleteSession,
    getCurrentSession,
  };
};