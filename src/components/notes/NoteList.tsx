import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Button,
  Fab,
  Badge,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Article as ArticleIcon,
  Description as MarkdownIcon,
  Code as CodeIcon,
  CheckBox as TaskIcon,
  Link as LinkIcon,
  NoteAdd as NoteAddIcon,
  Image as ImageIcon,
  FilterList as FilterIcon,
  Public as GlobalIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { useSearch } from '../../context/SearchContext';
import { formatRelativeTime, getFormatColor } from '../../utils/formatUtils';
import { NoteFormat, ContentBlock, TextBlock } from '../../types';
import SearchFiltersDialog from './SearchFiltersDialog';

const NoteList: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { 
    searchTerm, 
    setSearchTerm, 
    filters, 
    setFilters, 
    searchResults, 
    globalSearch, 
    setGlobalSearch,
    clearSearch
  } = useSearch();
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  // Get the active filter count for the badge
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.format) count++;
    if (filters.sortBy !== 'updatedAt') count++;
    if (filters.sortDirection !== 'desc') count++;
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length;
    if (globalSearch) count++;
    return count;
  };

  // Format icon mapping
  const getFormatIcon = (format: NoteFormat) => {
    switch (format) {
      case 'text':
        return <ArticleIcon fontSize="small" />;
      case 'markdown':
        return <MarkdownIcon fontSize="small" />;
      case 'code':
        return <CodeIcon fontSize="small" />;
      case 'task':
        return <TaskIcon fontSize="small" />;
      case 'link':
        return <LinkIcon fontSize="small" />;
      default:
        return <ArticleIcon fontSize="small" />;
    }
  };

  // Get preview text from content blocks
  const getNotePreview = (content: ContentBlock[]): React.ReactNode => {
    if (!content || content.length === 0) {
      return <Typography variant="body2" color="text.secondary">Empty note...</Typography>;
    }

    // Look for the first text block
    const firstTextBlock = content.find(block => block.type === 'text') as TextBlock | undefined;
    const hasImages = content.some(block => block.type === 'image');
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {firstTextBlock ? (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: hasImages ? 'calc(100% - 24px)' : '100%',
            }}
          >
            {firstTextBlock.content.substring(0, 60) || 'Empty note...'}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">No text content</Typography>
        )}
        
        {hasImages && (
          <Tooltip title="Contains images">
            <ImageIcon 
              fontSize="small" 
              color="action" 
              sx={{ ml: 1, fontSize: 16 }}
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  const handleAddNote = () => {
    if (!state.activeProject) return;
    
    // Create a new empty note (the content will be initialized in the reducer)
    const newNote = {
      title: 'Untitled Note',
      content: [],
      format: 'text' as NoteFormat,
      projectId: state.activeProject,
    };
    
    dispatch({ type: 'ADD_NOTE', payload: newNote });
  };

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      dispatch({ type: 'DELETE_NOTE', payload: noteId });
    }
  };

  const handleToggleGlobalSearch = () => {
    setGlobalSearch(!globalSearch);
  };

  // Show current search and filter status
  const renderSearchStatus = () => {
    const activeFilters = getActiveFilterCount();
    
    return (
      <Box sx={{ px: 2, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {searchTerm && (
          <Chip 
            label={`"${searchTerm}"`} 
            size="small" 
            onDelete={() => setSearchTerm('')}
            color="primary"
            variant="outlined"
          />
        )}
        
        {globalSearch && (
          <Chip 
            icon={<GlobalIcon fontSize="small" />}
            label="Global Search" 
            size="small" 
            onDelete={() => setGlobalSearch(false)}
            color="secondary"
            variant="outlined"
          />
        )}
        
        {filters.format && (
          <Chip 
            label={`Format: ${filters.format}`} 
            size="small" 
            onDelete={() => setFilters({...filters, format: null})}
            variant="outlined"
          />
        )}
        
        {(filters.sortBy !== 'updatedAt' || filters.sortDirection !== 'desc') && (
          <Chip 
            label={`Sort: ${filters.sortBy === 'title' ? 'Title' : 
                    filters.sortBy === 'createdAt' ? 'Created' : 'Updated'} 
                   ${filters.sortDirection === 'asc' ? '↑' : '↓'}`} 
            size="small" 
            variant="outlined"
          />
        )}
        
        {activeFilters > 0 && (
          <Chip 
            label="Clear All" 
            size="small" 
            onDelete={clearSearch}
            color="error"
            variant="outlined"
            deleteIcon={<ClearIcon />}
          />
        )}
      </Box>
    );
  };

  // Check if we have any notes to display
  const hasNotes = searchResults.length > 0;
  const showNoResults = searchTerm || globalSearch || filters.format || 
    (filters.tags && filters.tags.length > 0);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {globalSearch ? 'All Notes' : 
           state.activeProject ? 
            state.projects.find(p => p.id === state.activeProject)?.name :
            'Select Project'}
        </Typography>
        
        {state.activeProject && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddNote}
            size="small"
            sx={{ 
              boxShadow: 'none', 
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
            }}
          >
            New Note
          </Button>
        )}
      </Box>
      
      {/* Search */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            placeholder="Search notes..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchTerm('')} 
                    aria-label="clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                '&.Mui-focused': {
                  backgroundColor: 'white',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                }
              }
            }}
          />
          
          <Tooltip title={globalSearch ? "Project Search" : "Global Search"}>
            <IconButton 
              size="small" 
              color={globalSearch ? "secondary" : "default"}
              onClick={handleToggleGlobalSearch}
              sx={{ 
                p: 1,
                bgcolor: globalSearch ? 'rgba(156, 39, 176, 0.08)' : 'transparent' 
              }}
            >
              <GlobalIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Search Filters">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => setFiltersDialogOpen(true)}
              sx={{ p: 1 }}
            >
              <Badge badgeContent={getActiveFilterCount()} color="primary">
                <FilterIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Active Filters */}
      {getActiveFilterCount() > 0 && renderSearchStatus()}
      
      {/* Note List */}
      <List sx={{ overflow: 'auto', flex: 1, py: 0 }}>
        {state.activeProject || globalSearch ? (
          hasNotes ? (
            searchResults.map((note) => (
              <ListItem
                key={note.id}
                disablePadding
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ pr: 7 }}
              >
                <ListItemButton
                  selected={state.activeNote === note.id}
                  onClick={() => {
                    // If global search and clicking on note from other project,
                    // switch to that project first
                    if (globalSearch && note.projectId !== state.activeProject) {
                      dispatch({ type: 'SET_ACTIVE_PROJECT', payload: note.projectId });
                    }
                    dispatch({ type: 'SET_ACTIVE_NOTE', payload: note.id });
                  }}
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    borderLeft: '3px solid transparent',
                    borderLeftColor: state.activeNote === note.id ? getFormatColor(note.format) : 'transparent',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      },
                    },
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500, 
                          flexGrow: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {note.title}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ maxWidth: '70%' }}>
                        {getNotePreview(note.content)}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        <Tooltip title={`Format: ${note.format}`}>
                          <Box 
                            sx={{ 
                              color: getFormatColor(note.format),
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {getFormatIcon(note.format)}
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatRelativeTime(note.updatedAt)}
                      </Typography>
                      
                      {/* Show project name in global search */}
                      {globalSearch && (
                        <Tooltip title="Project">
                          <Chip
                            label={state.projects.find(p => p.id === note.projectId)?.name}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              height: 20, 
                              '& .MuiChip-label': { 
                                px: 1, 
                                fontSize: '0.625rem', 
                              } 
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NoteAddIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {showNoResults ? 'No matching notes found' : 'No notes yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {showNoResults ? 'Try different search terms or filters' : 'Create your first note to get started!'}
              </Typography>
              {!showNoResults && state.activeProject && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddNote}
                  sx={{ 
                    boxShadow: 'none', 
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                  }}
                >
                  Create Note
                </Button>
              )}
            </Box>
          )
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Select a project to view notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a project from the sidebar to create and manage notes
            </Typography>
          </Box>
        )}
      </List>
      
      {/* Floating Action Button for adding notes */}
      {state.activeProject && searchResults.length > 0 && (
        <Fab 
          color="primary" 
          size="medium"
          aria-label="add note"
          onClick={handleAddNote}
          sx={{ 
            position: 'absolute',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* Search Filters Dialog */}
      <SearchFiltersDialog
        open={filtersDialogOpen}
        onClose={() => setFiltersDialogOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </Box>
  );
};

export default NoteList; 