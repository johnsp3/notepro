import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  useTheme,
  Box,
  useMediaQuery,
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Menu as MenuIcon,
  NoteAlt as NoteIcon,
  SmartToy as ChatGPTIcon,
  Settings as SettingsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { ChatGPTDialog } from '../chatgpt';
import SettingsDialog from '../settings/SettingsDialog';
import { WebSearchDialog } from '../websearch';

interface HeaderProps {
  toggleSidebar: () => void;
  onAddProject: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, onAddProject }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [chatGPTOpen, setChatGPTOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [webSearchOpen, setWebSearchOpen] = useState(false);

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                onClick={toggleSidebar}
                size="large"
                edge="start"
                sx={{ 
                  marginRight: 2,
                  color: theme.palette.text.primary,
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{
                  width: 40,
                  height: 40,
                  mr: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                <NoteIcon fontSize="small" />
              </Avatar>
              <Typography 
                variant="h6" 
                noWrap 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                }}
              >
                NotePro
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Settings">
              <IconButton 
                color="inherit" 
                onClick={() => setSettingsOpen(true)}
                sx={{ mr: 1 }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Web Search">
              <Button
                variant="outlined"
                color="info"
                startIcon={<SearchIcon />}
                onClick={() => setWebSearchOpen(true)}
                sx={{
                  borderRadius: '24px',
                  mr: 2,
                  px: isMobile ? 1 : 2,
                  py: 1,
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                {!isMobile && "Web Search"}
              </Button>
            </Tooltip>
            
            <Tooltip title="ChatGPT Assistant">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ChatGPTIcon />}
                onClick={() => setChatGPTOpen(true)}
                sx={{
                  borderRadius: '24px',
                  mr: 2,
                  px: isMobile ? 1 : 2,
                  py: 1,
                }}
              >
                {!isMobile && "AI Assistant"}
              </Button>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddProject}
              sx={{
                borderRadius: '24px',
                px: isMobile ? 2 : 3,
                py: 1,
              }}
            >
              {!isMobile && "New Project"}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <ChatGPTDialog 
        open={chatGPTOpen} 
        onClose={() => setChatGPTOpen(false)} 
      />
      
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      
      <WebSearchDialog 
        open={webSearchOpen}
        onClose={() => setWebSearchOpen(false)}
      />
    </>
  );
};

export default Header; 