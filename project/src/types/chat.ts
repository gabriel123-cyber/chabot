export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type AIModel = 'o3' | 'o4-mini' | 'gpt-4.1' | 'gpt-4o' | 'gemini-2.5-pro';

export interface GPT4FreeClient {
  chat: {
    completions: {
      create: (options: {
        model: string;
        messages: Array<{ role: string; content: string }>;
      }) => Promise<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>;
    };
  };
}