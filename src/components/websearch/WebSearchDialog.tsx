import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useChatGPT } from '../../context/ChatGPTContext';
import { performWebSearch } from '../../services/webSearch';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface WebSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SearchHistoryItem {
  query: string;
  answer: string;
  timestamp: number;
}

const WebSearchDialog: React.FC<WebSearchDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { apiKey } = useChatGPT();
  
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const resultEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom when new results arrive
  React.useEffect(() => {
    if (resultEndRef.current && searchHistory.length > 0) {
      resultEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchHistory]);
  
  const handleSearch = async () => {
    if (!query.trim() || !apiKey) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await performWebSearch(query, apiKey);
      
      if (result.success && result.answer) {
        // Add to search history
        setSearchHistory(prev => [
          ...prev,
          {
            query,
            answer: result.answer || 'No results found',
            timestamp: Date.now()
          }
        ]);
        
        // Clear the search input
        setQuery('');
      } else {
        setError(result.error || 'Failed to get search results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };
  
  const clearHistory = () => {
    setSearchHistory([]);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      fullScreen={fullScreen}
      sx={{
        '& .MuiDialog-paper': {
          height: fullScreen ? '100%' : '80vh',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Real-Time Web Search</Typography>
          </Box>
          <Box>
            {searchHistory.length > 0 && (
              <Button 
                onClick={clearHistory} 
                color="inherit" 
                size="small" 
                sx={{ mr: 1 }}
              >
                Clear History
              </Button>
            )}
            <IconButton onClick={onClose} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
        {!apiKey && (
          <Alert 
            severity="warning" 
            sx={{ mx: 2, mt: 2 }}
          >
            OpenAI API Key is required to use web search features.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {searchHistory.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: 'text.secondary'
            }}>
              <SearchIcon sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />
              <Typography variant="h6" gutterBottom>
                Search the Web for Real-Time Information
              </Typography>
              <Typography variant="body2" sx={{ maxWidth: 500 }}>
                Get up-to-date information from across the internet. Perfect for current events, 
                fact-checking, or research that requires the latest data.
              </Typography>
            </Box>
          ) : (
            searchHistory.map((item, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 1,
                    bgcolor: 'primary.light',
                    borderRadius: 2,
                    borderBottomRightRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    {item.query}
                  </Typography>
                </Paper>
                
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    borderTopRightRadius: 0,
                  }}
                >
                  <Typography 
                    variant="body1" 
                    component="div" 
                    sx={{ 
                      '& pre': { 
                        overflowX: 'auto',
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        p: 1,
                        borderRadius: 1
                      },
                      '& code': {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        padding: '0.1em 0.3em',
                        borderRadius: '0.3em',
                      },
                      '& a': {
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }
                    }}
                  >
                    <ReactMarkdown
                      rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                      remarkPlugins={[remarkGfm]}
                    >
                      {item.answer}
                    </ReactMarkdown>
                  </Typography>
                </Paper>
                
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5, ml: 1 }}
                >
                  {new Date(item.timestamp).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={resultEndRef} />
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search for the latest information..."
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading || !apiKey}
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={isLoading ? 
                    <CircularProgress 
                      size={20} 
                      sx={{ 
                        color: 'inherit',
                        opacity: 0.9 
                      }} 
                    /> : 
                    <SearchIcon />
                  }
                  onClick={handleSearch}
                  disabled={!query.trim() || isLoading || !apiKey}
                  sx={{ 
                    ml: 1,
                    ...(isLoading && {
                      opacity: 0.9,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 'inherit'
                      }
                    })
                  }}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              ),
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WebSearchDialog; 