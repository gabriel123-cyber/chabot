import { useState, useEffect, useRef } from 'react';
import { GPT4FreeClient, AIModel } from '../types/chat';

export const useGPT4Free = () => {
  const [client, setClient] = useState<GPT4FreeClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<GPT4FreeClient | null>(null);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Dynamic import of the gpt4free client
        const { default: Client } = await import('https://g4f.dev/dist/js/client.js');
        const newClient = new Client();
        
        clientRef.current = newClient;
        setClient(newClient);
      } catch (err) {
        console.error('Failed to initialize GPT4Free client:', err);
        setError('Failed to load AI client. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();
  }, []);

  const sendMessage = async (
    messages: Array<{ role: string; content: string }>,
    model: AIModel = 'gpt-4.1'
  ) => {
    if (!clientRef.current) {
      throw new Error('Client not initialized');
    }

    try {
      const result = await clientRef.current.chat.completions.create({
        model,
        messages,
      });

      return result.choices[0].message.content;
    } catch (err) {
      console.error('API call failed:', err);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  };

  return {
    client,
    isLoading,
    error,
    sendMessage,
  };
};