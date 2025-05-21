import React from 'react';
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
} from '@mui/material';
import {
  Close as CloseIcon,
  Palette as PaletteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Apple as AppleIcon,
  Style as StyleIcon,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const muiTheme = useMuiTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const { settings, setThemeMode, setThemeVariant, toggleFollowSystem } = useTheme();

  const handleThemeModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThemeMode(event.target.value as 'light' | 'dark' | 'system');
  };

  const handleThemeVariantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThemeVariant(event.target.value as 'default' | 'apple');
  };

  const handleSystemFollowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleFollowSystem();
  };

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