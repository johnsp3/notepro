import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { AppState, Project, Note, NoteFormat, ContentBlock, TextBlock } from '../types';
import db, { saveNote, getAllNotes } from '../services/database';

// Initial state
const initialState: AppState = {
  projects: [],
  notes: [],
  activeProject: null,
  activeNote: null,
};

// Action types
type Action =
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_NOTE'; payload: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_ACTIVE_PROJECT'; payload: string | null }
  | { type: 'SET_ACTIVE_NOTE'; payload: string | null }
  | { type: 'INIT_FROM_DB'; payload: { notes: Note[], projects: Project[] } };

// Detect note format based on text content
export const detectNoteFormat = (content: string): NoteFormat => {
  if (!content) return 'text';
  
  // Check for code (simple heuristic: contains code-like syntax)
  if (content.includes('function') || content.includes('class') || content.includes('var') || 
      content.includes('const') || content.includes('let') || content.includes('import') ||
      (content.includes('{') && content.includes('}'))) {
    return 'code';
  }
  
  // Check for markdown
  if (content.includes('#') || content.includes('**') || content.includes('__') || 
      content.includes('```') || content.includes('- ') || content.includes('1. ')) {
    return 'markdown';
  }
  
  // Check for task list
  if (content.includes('[ ]') || content.includes('[x]') || 
      /^\s*-\s+(\[\s\]|\[x\])/.test(content)) {
    return 'task';
  }
  
  // Check for URL/link
  if (/https?:\/\/[^\s]+/.test(content) || /www\.[^\s]+/.test(content)) {
    return 'link';
  }
  
  // Default to text
  return 'text';
};

// Helper to convert old string content to ContentBlock array
const convertStringToContentBlocks = (content: string): ContentBlock[] => {
  return [
    {
      type: 'text',
      id: `text-${Date.now()}-${nanoid(6)}`,
      content
    }
  ];
};

// Reducer function
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_PROJECT': {
      const timestamp = Date.now();
      const newProject: Project = {
        id: nanoid(),
        ...action.payload,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      return {
        ...state,
        projects: [...state.projects, newProject],
      };
    }
    
    case 'UPDATE_PROJECT': {
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id
            ? { ...action.payload, updatedAt: Date.now() }
            : project
        ),
      };
    }
    
    case 'DELETE_PROJECT': {
      // Also delete all notes belonging to this project
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        notes: state.notes.filter(note => note.projectId !== action.payload),
        activeProject: state.activeProject === action.payload ? null : state.activeProject,
        activeNote: state.notes.find(note => note.id === state.activeNote)?.projectId === action.payload
          ? null
          : state.activeNote,
      };
    }
    
    case 'ADD_NOTE': {
      const timestamp = Date.now();
      
      // Create an initial text block
      const initialTextBlock: TextBlock = {
        type: 'text',
        id: `text-${timestamp}-${nanoid(6)}`,
        content: ''
      };
      
      const newNote: Note = {
        id: nanoid(),
        ...action.payload,
        content: [initialTextBlock],
        format: action.payload.format || 'text',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      // Save to IndexedDB
      saveNote(newNote);
      
      return {
        ...state,
        notes: [...state.notes, newNote],
        activeNote: newNote.id,
      };
    }
    
    case 'UPDATE_NOTE': {
      const updatedNote = { 
        ...action.payload, 
        updatedAt: Date.now() 
      };
      
      // Save to IndexedDB
      saveNote(updatedNote);
      
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === updatedNote.id ? updatedNote : note
        ),
      };
    }
    
    case 'DELETE_NOTE': {
      // Delete from IndexedDB
      db.notes.delete(action.payload);
      
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        activeNote: state.activeNote === action.payload ? null : state.activeNote,
      };
    }
    
    case 'SET_ACTIVE_PROJECT': {
      return {
        ...state,
        activeProject: action.payload,
        // Reset active note when changing projects
        activeNote: action.payload ? state.notes.find(note => 
          note.projectId === action.payload && 
          (state.activeNote ? note.id === state.activeNote : true)
        )?.id || null : null,
      };
    }
    
    case 'SET_ACTIVE_NOTE': {
      return {
        ...state,
        activeNote: action.payload,
      };
    }
    
    case 'INIT_FROM_DB': {
      return {
        ...state,
        notes: action.payload.notes,
        projects: action.payload.projects,
      };
    }
    
    default:
      return state;
  }
};

// Create context
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Local storage key
const STORAGE_KEY = 'notepro-state';

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [state, dispatch] = useReducer(appReducer, initialState, () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      return savedState ? JSON.parse(savedState) : initialState;
    } catch (error) {
      console.error('Failed to parse saved state:', error);
      return initialState;
    }
  });

  // Initialize data from IndexedDB
  useEffect(() => {
    const initFromDB = async () => {
      try {
        const notes = await getAllNotes();
        
        // If we have notes in IndexedDB, use them
        if (notes && notes.length > 0) {
          dispatch({ 
            type: 'INIT_FROM_DB', 
            payload: { 
              notes, 
              projects: state.projects 
            } 
          });
        } 
        // If no notes in IndexedDB but we have them in localStorage, migrate them
        else if (state.notes && state.notes.length > 0) {
          // Migrate existing notes to the new format with ContentBlocks
          const migratedNotes = state.notes.map(note => {
            // If content is a string, convert to ContentBlock[]
            if (typeof note.content === 'string') {
              return {
                ...note,
                content: convertStringToContentBlocks(note.content as unknown as string)
              };
            }
            return note;
          });
          
          // Save all migrated notes to IndexedDB
          for (const note of migratedNotes) {
            await saveNote(note);
          }
          
          dispatch({ 
            type: 'INIT_FROM_DB', 
            payload: { 
              notes: migratedNotes, 
              projects: state.projects 
            } 
          });
        }
      } catch (error) {
        console.error('Failed to initialize from DB:', error);
      }
    };
    
    initFromDB();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 