import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ChatMessage, callOpenAI, processNoteWithAI } from '../services/openai';
import { useAppContext } from './AppContext';
import { TextBlock } from '../types';

// Interface for the context
interface ChatGPTContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  chatMessages: ChatMessage[];
  addUserMessage: (message: string) => void;
  clearChat: () => void;
  processCurrentNote: (instruction: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  debugInfo: any | null;
  showDebugInfo: boolean;
  toggleDebugInfo: () => void;
}

// Default system message
const DEFAULT_SYSTEM_MESSAGE = {
  role: 'system' as const,
  content: 'You are an AI assistant integrated into NotePro, a note-taking application. Help users write, edit, and format their notes. You can also answer general questions.'
};

// Create context with default values
const ChatGPTContext = createContext<ChatGPTContextType | undefined>(undefined);

// LocalStorage key for API key
const API_KEY_STORAGE_KEY = 'notepro-openai-api-key';

// Provider component
export const ChatGPTProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state, dispatch } = useAppContext();
  const [apiKey, setApiKeyState] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([DEFAULT_SYSTEM_MESSAGE]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

  // Load API key from localStorage on initialization
  useEffect(() => {
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
    }
  }, []);

  // Set API key with storage
  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  }, []);

  // Add user message and get response
  const addUserMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Clear any previous errors
    setError(null);
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    
    // Call OpenAI API
    const newMessages = [...chatMessages, userMessage];
    const result = await callOpenAI(newMessages, apiKey);
    
    setIsLoading(false);
    
    if (result.success && result.data) {
      // Add assistant response to chat
      const assistantMessage: ChatMessage = { role: 'assistant', content: result.data };
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Store debug info
      setDebugInfo(result.debug);
    } else {
      setError(result.error || 'Failed to get response from OpenAI');
      setDebugInfo(result.debug);
    }
  }, [chatMessages, apiKey]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setChatMessages([DEFAULT_SYSTEM_MESSAGE]);
    setError(null);
    setDebugInfo(null);
  }, []);

  // Toggle debug info visibility
  const toggleDebugInfo = useCallback(() => {
    setShowDebugInfo(prev => !prev);
  }, []);

  // Process current note with AI
  const processCurrentNote = useCallback(async (instruction: string) => {
    if (!apiKey) {
      setError('API key is required. Please add your API key in settings.');
      return;
    }

    const activeNote = state.notes.find(note => note.id === state.activeNote);
    if (!activeNote) {
      setError('No active note to process.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await processNoteWithAI(activeNote, instruction, apiKey);
      
      if (result.success && result.content) {
        // Update the note content with the AI-processed content
        const updatedContent = activeNote.content.map(block => {
          if (block.type === 'text') {
            // Replace text blocks with AI-processed content
            // We'll keep the first block and remove others
            return {
              ...block,
              content: result.content
            } as TextBlock;
          }
          return block;
        }).slice(0, 1); // Keep only the first block
        
        // Update the note
        dispatch({
          type: 'UPDATE_NOTE',
          payload: {
            ...activeNote,
            content: updatedContent,
            updatedAt: Date.now()
          }
        });
      } else {
        setError(result.error || 'Failed to process note content.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, state.notes, state.activeNote, dispatch]);

  return (
    <ChatGPTContext.Provider value={{
      apiKey,
      setApiKey,
      chatMessages,
      addUserMessage,
      clearChat,
      processCurrentNote,
      isLoading,
      error,
      debugInfo,
      showDebugInfo,
      toggleDebugInfo
    }}>
      {children}
    </ChatGPTContext.Provider>
  );
};

// Custom hook to use the context
export const useChatGPT = (): ChatGPTContextType => {
  const context = useContext(ChatGPTContext);
  if (!context) {
    throw new Error('useChatGPT must be used within a ChatGPTProvider');
  }
  return context;
}; 