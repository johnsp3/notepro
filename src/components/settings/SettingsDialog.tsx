import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  IconButton,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Palette as PaletteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Apple as AppleIcon,
  Style as StyleIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useChatGPT } from '../../context/ChatGPTContext';
import { getOptionalEnvVar } from '../../utils/env';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

// Local storage key for API key preference
const USE_API_ENV_KEY = 'notepro-use-env-api-key';

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const muiTheme = useMuiTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const { settings, setThemeMode, setThemeVariant, toggleFollowSystem } = useTheme();
  const { apiKey } = useChatGPT();
  
  // State for the API key toggle
  const [useEnvApiKey, setUseEnvApiKey] = useState<boolean>(() => {
    const savedPref = localStorage.getItem(USE_API_ENV_KEY);
    return savedPref ? savedPref === 'true' : true; // Default to true
  });
  
  // Check if env API key is available
  const envApiKeyAvailable = !!getOptionalEnvVar('REACT_APP_OPENAI_API_KEY');

  const handleThemeModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThemeMode(event.target.value as 'light' | 'dark' | 'system');
  };

  const handleThemeVariantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThemeVariant(event.target.value as 'default' | 'apple');
  };

  const handleSystemFollowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleFollowSystem();
  };
  
  // Handle API key preference change
  const handleApiKeyPrefChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setUseEnvApiKey(newValue);
    localStorage.setItem(USE_API_ENV_KEY, newValue.toString());
  };
  
  // Save API key preference to localStorage
  useEffect(() => {
    localStorage.setItem(USE_API_ENV_KEY, useEnvApiKey.toString());
  }, [useEnvApiKey]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Settings</Typography>
          </Box>
          <IconButton onClick={onClose} edge="end" aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* ChatGPT API Key Settings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AIIcon sx={{ mr: 1 }} /> AI Assistant Settings
          </Typography>
          
          <Box sx={{ mt: 2, pl: 1 }}>
            <Tooltip title={
              envApiKeyAvailable 
                ? "Use the app's environment variable API key instead of manually entering your own" 
                : "No environment API key is configured"
            }>
              <FormControlLabel
                control={
                  <Switch
                    checked={useEnvApiKey}
                    onChange={handleApiKeyPrefChange}
                    color="primary"
                    disabled={!envApiKeyAvailable}
                  />
                }
                label="Use app's built-in API key"
              />
            </Tooltip>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, pl: 2 }}>
              {useEnvApiKey && envApiKeyAvailable 
                ? "Using the app's built-in API key. You don't need to provide your own."
                : apiKey 
                  ? "Using your manually entered API key."
                  : "No API key provided. Please enter your OpenAI API key in the AI Assistant."
              }
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <StyleIcon sx={{ mr: 1 }} /> Theme Variant
          </Typography>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              aria-label="theme-variant"
              name="theme-variant"
              value={settings.variant}
              onChange={handleThemeVariantChange}
            >
              <FormControlLabel
                value="default"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AutoAwesomeIcon sx={{ mr: 1 }} />
                    <Typography>Default Theme</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="apple"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AppleIcon sx={{ mr: 1 }} />
                    <Typography>Apple Inspired</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PaletteIcon sx={{ mr: 1 }} /> Theme Mode
          </Typography>
          
          <FormControl component="fieldset" sx={{ mb: 2, mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.followSystem}
                  onChange={handleSystemFollowChange}
                  color="primary"
                />
              }
              label="Follow system theme"
            />
          </FormControl>

          {!settings.followSystem && (
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <RadioGroup
                aria-label="theme-mode"
                name="theme-mode"
                value={settings.mode}
                onChange={handleThemeModeChange}
              >
                <FormControlLabel
                  value="light"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LightModeIcon sx={{ mr: 1 }} />
                      <Typography>Light Mode</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="dark"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DarkModeIcon sx={{ mr: 1 }} />
                      <Typography>Dark Mode</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

export default SettingsDialog; 