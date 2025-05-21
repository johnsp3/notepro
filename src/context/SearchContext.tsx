import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAppContext } from './AppContext';
import { Note, TextBlock, NoteFormat } from '../types';

// Define search filters
export interface SearchFilters {
  format?: NoteFormat | null;
  sortBy: 'updatedAt' | 'createdAt' | 'title';
  sortDirection: 'asc' | 'desc';
  tags?: string[];
}

// Define search context type
interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  globalSearch: boolean;
  setGlobalSearch: (global: boolean) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  searchResults: Note[];
  searching: boolean;
  clearSearch: () => void;
}

// Create context with default values
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Default filters
const defaultFilters: SearchFilters = {
  format: null,
  sortBy: 'updatedAt',
  sortDirection: 'desc',
};

// Provider component
export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearch, setGlobalSearch] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [searching, setSearching] = useState(false);

  // Function to perform the search
  const searchResults = useCallback(() => {
    // If no active project and not in global search, return empty array
    if (!state.activeProject && !globalSearch) {
      return [];
    }

    if (!searchTerm && !filters.format && !filters.tags?.length) {
      // If no search criteria, just apply sorting
      const allNotes = globalSearch 
        ? state.notes 
        : state.notes.filter(note => note.projectId === state.activeProject);
      
      return sortNotes(allNotes, filters);
    }

    setSearching(true);
    
    // Filter notes based on active project or global search
    let filteredNotes = globalSearch 
      ? state.notes
      : state.notes.filter(note => note.projectId === state.activeProject);
    
    // Apply search term if present
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredNotes = filteredNotes.filter(note => {
        // Check title
        if (note.title.toLowerCase().includes(lowerSearchTerm)) {
          return true;
        }
        
        // Check content of text blocks
        return note.content.some(block => 
          block.type === 'text' && 
          (block as TextBlock).content.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }
    
    // Apply format filter if present
    if (filters.format) {
      filteredNotes = filteredNotes.filter(note => note.format === filters.format);
    }
    
    // Apply tag filter if present
    if (filters.tags && filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter(note => {
        if (!note.tags) return false;
        return filters.tags!.some(tag => note.tags!.includes(tag));
      });
    }
    
    // Apply sorting
    const sortedNotes = sortNotes(filteredNotes, filters);
    
    setSearching(false);
    return sortedNotes;
  }, [searchTerm, globalSearch, filters, state.notes, state.activeProject]);

  // Helper function to sort notes
  const sortNotes = (notes: Note[], filters: SearchFilters) => {
    return [...notes].sort((a, b) => {
      let comparison = 0;
      
      if (filters.sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else {
        // For dates, we compare numbers
        comparison = a[filters.sortBy] - b[filters.sortBy];
      }
      
      // Apply sort direction
      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilters(defaultFilters);
    setGlobalSearch(false);
  }, []);

  return (
    <SearchContext.Provider value={{
      searchTerm,
      setSearchTerm,
      globalSearch,
      setGlobalSearch,
      filters,
      setFilters,
      searchResults: searchResults(),
      searching,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook to use the context
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 