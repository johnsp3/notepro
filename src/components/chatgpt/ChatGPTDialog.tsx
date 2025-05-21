import React, { useState, useRef, useEffect } from 'react';
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
  Tabs,
  Tab,
  Tooltip,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  ChatBubble as ChatBubbleIcon,
  Delete as DeleteIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { useChatGPT } from '../../context/ChatGPTContext';
import APIKeyDialog from './APIKeyDialog';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface ChatGPTDialogProps {
  open: boolean;
  onClose: () => void;
}

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chatgpt-tabpanel-${index}`}
      aria-labelledby={`chatgpt-tab-${index}`}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `chatgpt-tab-${index}`,
    'aria-controls': `chatgpt-tabpanel-${index}`,
  };
}

const ChatGPTDialog: React.FC<ChatGPTDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const {
    apiKey,
    chatMessages,
    addUserMessage,
    clearChat,
    processCurrentNote,
    isLoading,
    error,
    debugInfo,
    showDebugInfo,
    toggleDebugInfo,
  } = useChatGPT();
  
  const [message, setMessage] = useState('');
  const [instruction, setInstruction] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);
  
  // Show API key dialog if no key is set
  useEffect(() => {
    if (open && !apiKey) {
      setShowSettings(true);
    }
  }, [open, apiKey]);
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    addUserMessage(message);
    setMessage('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (tabValue === 0) {
        handleSendMessage();
      } else {
        handleProcessNote();
      }
    }
  };
  
  const handleProcessNote = () => {
    if (!instruction.trim()) return;
    processCurrentNote(instruction);
    // Don't clear the instruction, user might want to try variations
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <>
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
              <ChatBubbleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">ChatGPT Assistant</Typography>
            </Box>
            <Box>
              <Tooltip title="API Key Settings">
                <IconButton onClick={() => setShowSettings(true)} color="primary">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Toggle Debug Info">
                <IconButton onClick={toggleDebugInfo} color={showDebugInfo ? "secondary" : "default"}>
                  <BugReportIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear Chat">
                <IconButton onClick={clearChat} color="primary">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={onClose} color="inherit">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="chatgpt tabs">
            <Tab 
              icon={<ChatBubbleIcon fontSize="small" />} 
              label="Chat" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<CodeIcon fontSize="small" />} 
              label="Editor Mode" 
              {...a11yProps(1)} 
            />
          </Tabs>
        </Box>
        
        <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
          {!apiKey && (
            <Alert 
              severity="warning" 
              action={
                <Button size="small" onClick={() => setShowSettings(true)}>
                  Add API Key
                </Button>
              }
              sx={{ mx: 2, mt: 2 }}
            >
              OpenAI API Key is required to use ChatGPT features.
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <TabPanel value={tabValue} index={0}>
            {/* Chat Mode */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {chatMessages.length <= 1 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  color: 'text.secondary'
                }}>
                  <ChatBubbleIcon sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />
                  <Typography variant="h6" gutterBottom>
                    Chat with AI Assistant
                  </Typography>
                  <Typography variant="body2" sx={{ maxWidth: 400 }}>
                    Ask me anything! I can help you with note formatting, writing, or general questions.
                  </Typography>
                </Box>
              ) : (
                chatMessages.slice(1).map((msg, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                        ml: msg.role === 'user' ? 'auto' : 0,
                        mr: msg.role === 'assistant' ? 'auto' : 0,
                        maxWidth: '75%',
                        borderRadius: 2,
                        borderTopRightRadius: msg.role === 'user' ? 0 : 2,
                        borderTopLeftRadius: msg.role === 'assistant' ? 0 : 2,
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
                          }
                        }}
                      >
                        {msg.role === 'assistant' ? (
                          <ReactMarkdown
                            rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                            remarkPlugins={[remarkGfm]}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </Typography>
                    </Paper>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        textAlign: msg.role === 'user' ? 'right' : 'left',
                        mt: 0.5,
                        mx: 1,
                        color: 'text.secondary'
                      }}
                    >
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </Typography>
                  </Box>
                ))
              )}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              <div ref={messageEndRef} />
            </Box>
            
            <Divider />
            
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                variant="outlined"
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
                        <SendIcon />
                      }
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading || !apiKey}
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
                      {isLoading ? 'Processing...' : 'Send'}
                    </Button>
                  ),
                }}
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {/* Editor Mode */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Edit Note with AI
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Enter an instruction for how you want to modify the current note. The AI will process
                your note content and replace it with the result.
              </Typography>
              
              <Box sx={{ flex: 1, mb: 2 }}>
                <TextField
                  label="Instruction for AI"
                  multiline
                  fullWidth
                  rows={4}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="E.g., 'Convert this text to markdown format', 'Fix spelling and grammar', 'Summarize this text', etc."
                  variant="outlined"
                  disabled={isLoading || !apiKey}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                    <RefreshIcon />
                  }
                  onClick={handleProcessNote}
                  disabled={!instruction.trim() || isLoading || !apiKey}
                  sx={{ 
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
                  {isLoading ? 'Processing...' : 'Process Note'}
                </Button>
              </Box>
            </Box>
          </TabPanel>
        </DialogContent>
      </Dialog>
      
      {/* API Key Dialog */}
      <APIKeyDialog 
        open={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      {/* Debug Info Drawer */}
      <Drawer
        anchor="right"
        open={showDebugInfo}
        onClose={toggleDebugInfo}
        sx={{
          '& .MuiDrawer-paper': { width: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Debug Information</Typography>
            <IconButton onClick={toggleDebugInfo}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            API Key Status
          </Typography>
          <Alert severity={apiKey ? "success" : "warning"} sx={{ mb: 2 }}>
            {apiKey ? "API Key is set" : "API Key is not set"}
          </Alert>
          
          <Typography variant="subtitle2" gutterBottom>
            Last API Call
          </Typography>
          {debugInfo ? (
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                overflowX: 'auto',
                fontSize: '0.75rem',
              }}
            >
              {JSON.stringify(debugInfo, null, 2)}
            </Box>
          ) : (
            <Alert severity="info">No API call made yet</Alert>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default ChatGPTDialog; 