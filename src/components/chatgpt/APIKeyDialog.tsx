import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Link,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useChatGPT } from '../../context/ChatGPTContext';
import { getOptionalEnvVar } from '../../utils/env';

interface APIKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

// LocalStorage key for API key preference
const USE_API_ENV_KEY = 'notepro-use-env-api-key';

const APIKeyDialog: React.FC<APIKeyDialogProps> = ({ open, onClose }) => {
  const { apiKey, setApiKey } = useChatGPT();
  const [keyValue, setKeyValue] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [useEnvApiKey, setUseEnvApiKey] = useState<boolean>(false);
  
  // Check if env API key is available
  const envApiKeyAvailable = !!getOptionalEnvVar('REACT_APP_OPENAI_API_KEY');
  
  // Load API key preference
  useEffect(() => {
    const savedPref = localStorage.getItem(USE_API_ENV_KEY);
    if (savedPref !== null) {
      setUseEnvApiKey(savedPref === 'true');
    }
  }, []);
  
  const handleToggleShowKey = () => {
    setShowKey(!showKey);
  };
  
  const handleSave = () => {
    // Basic validation
    if (!keyValue.trim()) {
      setKeyError('API key is required');
      return;
    }
    
    if (!keyValue.startsWith('sk-')) {
      setKeyError('Invalid API key format. OpenAI keys typically start with "sk-"');
      return;
    }
    
    setApiKey(keyValue.trim());
    onClose();
  };
  
  const handleCancel = () => {
    setKeyValue(apiKey);
    setKeyError(null);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">OpenAI API Key</Typography>
          <IconButton edge="end" color="inherit" onClick={handleCancel} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" paragraph>
            To use ChatGPT features, you need to provide your OpenAI API key. This key will be stored
            locally in your browser and is never sent to our servers.
          </Typography>
          
          <Typography variant="body2" paragraph>
            You can get an API key from the{' '}
            <Link 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              OpenAI API Keys page
            </Link>.
          </Typography>
          
          {envApiKeyAvailable && (
            <Alert 
              severity="info" 
              sx={{ mb: 2 }} 
              icon={<InfoIcon />}
            >
              <Typography variant="body2">
                This app has a built-in API key available. You can enable it in Settings to avoid entering your own key.
              </Typography>
              {useEnvApiKey && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  You're currently using the app's built-in API key. No need to enter your own key.
                </Typography>
              )}
            </Alert>
          )}
          
          {!useEnvApiKey && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Your API key is stored securely in your browser's local storage.
            </Alert>
          )}
        </Box>
        
        {!useEnvApiKey && (
          <TextField
            fullWidth
            label="OpenAI API Key"
            value={keyValue}
            onChange={(e) => {
              setKeyValue(e.target.value);
              setKeyError(null);
            }}
            error={!!keyError}
            helperText={keyError}
            placeholder="sk-..."
            type={showKey ? 'text' : 'password'}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle key visibility"
                    onClick={handleToggleShowKey}
                    edge="end"
                  >
                    {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
        
        {useEnvApiKey && (
          <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              You're using the app's built-in API key. If you want to use your own key instead, 
              please go to Settings and turn off "Use app's built-in API key".
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        {!useEnvApiKey && (
          <Button 
            onClick={handleSave} 
            color="primary" 
            variant="contained"
            disabled={!keyValue || !!keyError}
          >
            Save API Key
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default APIKeyDialog; 