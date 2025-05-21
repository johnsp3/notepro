import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  Save as SaveIcon,
  Article as ArticleIcon,
  Description as MarkdownIcon,
  Code as CodeIcon,
  CheckBox as TaskIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as PreviewIcon,
  ViewColumn as SplitScreenIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { detectNoteFormat } from '../../context/AppContext';
import { formatDate, getFormatColor } from '../../utils/formatUtils';
import { NoteFormat, ContentBlock, TextBlock, ImageBlock } from '../../types';
import useNotification from '../../hooks/useNotification';
import { useImagePaste } from '../../hooks/useImagePaste';
import { nanoid } from 'nanoid';
import MarkdownPreview from './MarkdownPreview';
import ImageUploader from './ImageUploader';
import ShareNoteDialog from './ShareNoteDialog';

// View modes for markdown notes
type ViewMode = 'edit' | 'preview' | 'split';

const NoteEditor: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { showFormatDetectedNotification, showNotification } = useNotification();
  const editorRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [format, setFormat] = useState<NoteFormat>('text');
  const [isModified, setIsModified] = useState(false);
  const [lastFormatDetection, setLastFormatDetection] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const activeNote = state.notes.find(note => note.id === state.activeNote);

  // Load active note data
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setFormat(activeNote.format);
      setIsModified(false);
      setLastFormatDetection(''); // Reset format detection
    } else {
      setTitle('');
      setContent([]);
      setFormat('text');
      setIsModified(false);
      setLastFormatDetection('');
    }
  }, [activeNote]);

  // Handle content change
  const handleContentChange = useCallback((newContent: ContentBlock[]) => {
    setContent(newContent);
    setIsModified(true);
    
    // Reset format detection to force recheck on next render
    setLastFormatDetection('');
  }, []);

  // Handle image paste
  const handleImagePaste = useCallback((dataUrl: string) => {
    if (!activeNote) return;
    
    const newImageBlock: ImageBlock = {
      type: 'image',
      id: `img-${Date.now()}-${nanoid(6)}`,
      dataUrl
    };
    
    handleContentChange([...content, newImageBlock]);
  }, [activeNote, content, handleContentChange]);

  // Attach paste event listener
  const pasteFn = useImagePaste(handleImagePaste);
  
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('paste', pasteFn as any);
      return () => {
        editor.removeEventListener('paste', pasteFn as any);
      };
    }
  }, [pasteFn]);

  // Format detection (only check text blocks)
  useEffect(() => {
    if (content.length > 0) {
      // Combine text blocks for format detection
      const textContent = content
        .filter(block => block.type === 'text')
        .map(block => (block as TextBlock).content)
        .join('\n');
        
      if (textContent && textContent !== lastFormatDetection) {
        const detectedFormat = detectNoteFormat(textContent);
        
        if (detectedFormat !== format) {
          setFormat(detectedFormat);
          
          // Reset view mode to edit if switching to/from markdown
          if ((detectedFormat === 'markdown' && format !== 'markdown') ||
              (detectedFormat !== 'markdown' && format === 'markdown')) {
            setViewMode('edit');
          }
          
          showFormatDetectedNotification(detectedFormat);
        }
        setLastFormatDetection(textContent);
      }
    }
  }, [content, format, lastFormatDetection, showFormatDetectedNotification]);

  const handleSave = useCallback(() => {
    if (!activeNote || !isModified) return;

    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        ...activeNote,
        title,
        content,
        format,
      },
    });

    setIsModified(false);
  }, [activeNote, dispatch, format, content, title, isModified]);

  // Auto-save on content change (debounced)
  useEffect(() => {
    if (isModified) {
      const timer = setTimeout(() => {
        handleSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [handleSave, isModified]);

  // Handle deletion of a content block
  const handleDeleteBlock = useCallback((blockId: string) => {
    const newContent = content.filter(block => block.id !== blockId);
    handleContentChange(newContent);
  }, [content, handleContentChange]);

  // Handle text block content change
  const handleTextBlockChange = useCallback((blockId: string, newText: string) => {
    const newContent = content.map(block => 
      block.id === blockId
        ? { ...block, content: newText } as TextBlock
        : block
    );
    handleContentChange(newContent);
  }, [content, handleContentChange]);

  // Toggle between edit, preview, and split view modes
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
      
      // Show a notification when view mode changes
      const modeLabels = {
        'edit': 'Edit Mode',
        'preview': 'Preview Mode',
        'split': 'Split View'
      };
      showNotification(`Switched to ${modeLabels[newMode]}`, 'info');
    }
  };

  // Combine all text blocks for preview
  const getCombinedMarkdownContent = useCallback(() => {
    return content
      .filter(block => block.type === 'text')
      .map(block => (block as TextBlock).content)
      .join('\n\n');
  }, [content]);

  // Format utilities
  const getFormatIcon = (noteFormat: NoteFormat) => {
    switch (noteFormat) {
      case 'text':
        return <ArticleIcon />;
      case 'markdown':
        return <MarkdownIcon />;
      case 'code':
        return <CodeIcon />;
      case 'task':
        return <TaskIcon />;
      case 'link':
        return <LinkIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  const getFormatName = (noteFormat: NoteFormat) => {
    switch (noteFormat) {
      case 'text':
        return 'Plain Text';
      case 'markdown':
        return 'Markdown';
      case 'code':
        return 'Code';
      case 'task':
        return 'Task List';
      case 'link':
        return 'Link';
      default:
        return 'Plain Text';
    }
  };

  // Add new text block
  const addNewTextBlock = useCallback(() => {
    const newTextBlock: TextBlock = {
      type: 'text',
      id: `text-${Date.now()}-${nanoid(6)}`,
      content: ''
    };
    handleContentChange([...content, newTextBlock]);
  }, [content, handleContentChange]);

  // Add an image block
  const addImageBlock = useCallback((dataUrl: string) => {
    const newImageBlock: ImageBlock = {
      type: 'image',
      id: `img-${Date.now()}-${nanoid(6)}`,
      dataUrl
    };
    handleContentChange([...content, newImageBlock]);
  }, [content, handleContentChange]);

  // Handle image upload
  const handleImageUpload = useCallback((dataUrl: string) => {
    addImageBlock(dataUrl);
  }, [addImageBlock]);

  const handleShareNote = () => {
    if (!activeNote) return;
    setShareDialogOpen(true);
  };

  if (!activeNote) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100%', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 4,
          backgroundColor: 'background.default',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 600,
            textAlign: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" color="text.primary" gutterBottom>
            No Note Selected
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Select a note from the list or create a new one to get started.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You can create a new note by:
          </Typography>
          <Box sx={{ 
            textAlign: 'left', 
            display: 'inline-block', 
            mb: 2,
            '& li': { mb: 1 } 
          }}>
            <ol>
              <li>Clicking the "New Note" button at the top of the notes panel</li>
              <li>Using the floating "+" button in the bottom right of the notes panel</li>
              <li>Clicking the "Create Note" button when you have no notes yet</li>
            </ol>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Once created, your note will automatically detect the format based on its content!
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}
      ref={editorRef}
    >
      {/* Editor Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={getFormatIcon(format)}
            label={getFormatName(format)}
            sx={{
              backgroundColor: getFormatColor(format),
              color: 'white',
              mr: 1,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {activeNote ? `Last updated: ${formatDate(activeNote.updatedAt)}` : ''}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Share Button */}
          <Tooltip title="Share">
            <IconButton 
              onClick={handleShareNote}
              sx={{ mr: 1 }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
          
          {/* Save Button */}
          <Tooltip title="Save">
            <IconButton 
              onClick={handleSave} 
              disabled={!isModified}
              color={isModified ? 'primary' : 'default'}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* PROMINENT Markdown View Buttons - Always show */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 2, 
        gap: 1,
        backgroundColor: 'rgba(0,0,0,0.05)', 
        p: 1.5,
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <Button
          variant={viewMode === 'edit' ? 'contained' : 'outlined'}
          startIcon={<EditIcon />}
          onClick={(e) => handleViewModeChange(e, 'edit')}
          size="small"
        >
          Edit
        </Button>
        <Button
          variant={viewMode === 'preview' ? 'contained' : 'outlined'}
          startIcon={<PreviewIcon />}
          onClick={(e) => handleViewModeChange(e, 'preview')}
          size="small"
        >
          Preview
        </Button>
        <Button
          variant={viewMode === 'split' ? 'contained' : 'outlined'}
          startIcon={<SplitScreenIcon />}
          onClick={(e) => handleViewModeChange(e, 'split')}
          size="small"
        >
          Split View
        </Button>
      </Box>
      
      {/* Title Input */}
      <TextField
        placeholder="Note Title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setIsModified(true);
        }}
        variant="standard"
        fullWidth
        sx={{ 
          mb: 2,
          '& .MuiInputBase-input': {
            fontSize: '1.5rem',
            fontWeight: 500,
          },
          '& .MuiInput-underline:before': {
            borderBottomColor: 'transparent',
          },
        }}
      />
      
      {/* Content Area - Conditional rendering based on view mode */}
      {viewMode === 'preview' ? (
        // Preview Mode
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
        }}>
          <MarkdownPreview content={getCombinedMarkdownContent()} />
        </Box>
      ) : viewMode === 'split' ? (
        // Split View Mode
        <Box className="split-view" sx={{ 
          flex: 1, 
          display: 'flex',
          gap: 2
        }}>
          {/* Editor Side */}
          <Box className="split-view-editor" sx={{ 
            flex: 1, 
            overflow: 'auto',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              p: 2
            }}>
              {content.map((block) => (
                <Box key={block.id} sx={{ position: 'relative' }}>
                  {block.type === 'text' ? (
                    <TextField
                      placeholder="Start typing..."
                      value={(block as TextBlock).content}
                      onChange={(e) => handleTextBlockChange(block.id, e.target.value)}
                      multiline
                      fullWidth
                      variant="outlined"
                      minRows={3}
                    />
                  ) : block.type === 'image' ? (
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={(block as ImageBlock).dataUrl}
                        alt="Embedded content"
                        style={{
                          maxWidth: '100%',
                          display: 'block',
                          borderRadius: '8px',
                        }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                          },
                        }}
                        onClick={() => handleDeleteBlock(block.id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : null}
                </Box>
              ))}
              {/* Add Block Button (Only shown in editor panel) */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={addNewTextBlock}
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  Add Text Block
                </Button>
              </Box>
            </Box>
          </Box>
          
          {/* Preview Side */}
          <Box className="split-view-preview" sx={{ 
            flex: 1, 
            overflow: 'auto',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
          }}>
            <MarkdownPreview content={getCombinedMarkdownContent()} />
          </Box>
        </Box>
      ) : (
        // Default Edit Mode
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            overflowY: 'auto'
          }}
        >
          {content.map((block) => (
            <Box key={block.id} sx={{ position: 'relative' }}>
              {block.type === 'text' ? (
                <TextField
                  placeholder="Start typing..."
                  value={(block as TextBlock).content}
                  onChange={(e) => handleTextBlockChange(block.id, e.target.value)}
                  multiline
                  fullWidth
                  variant="outlined"
                  minRows={3}
                />
              ) : block.type === 'image' ? (
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={(block as ImageBlock).dataUrl}
                    alt="Embedded content"
                    style={{
                      maxWidth: '100%',
                      display: 'block',
                      borderRadius: '8px',
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                      },
                    }}
                    onClick={() => handleDeleteBlock(block.id)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : null}
            </Box>
          ))}
        </Box>
      )}
      
      {/* Add New Block Button - Only shown in edit mode */}
      {viewMode === 'edit' && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Button 
              variant="outlined" 
              onClick={addNewTextBlock}
              sx={{ 
                textTransform: 'none',
                mx: 1,
                borderRadius: 2
              }}
              startIcon={<ArticleIcon />}
            >
              Add Text Block
            </Button>
            
            <ImageUploader onImageUpload={handleImageUpload} />
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 1 }}
          >
            You can also paste images directly from your clipboard
          </Typography>
        </Box>
      )}
      
      {/* Share Note Dialog */}
      <ShareNoteDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        note={activeNote}
      />
    </Box>
  );
};

export default NoteEditor; 