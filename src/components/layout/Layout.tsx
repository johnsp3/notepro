import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import NotificationBar from './NotificationBar';
import { ProjectDialog } from '../projects';
import { Project } from '../../types';
import useNotification from '../../hooks/useNotification';
import { NoteList, NoteEditor } from '../notes';

const DRAWER_WIDTH = 260;

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { notification, hideNotification } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Automatically close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddProject = () => {
    setCurrentProject(null);
    setProjectDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setProjectDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      <Header 
        toggleSidebar={toggleSidebar} 
        onAddProject={handleAddProject}
      />
      
      <Sidebar
        open={sidebarOpen}
        width={DRAWER_WIDTH}
        onAddProject={handleAddProject}
        onEditProject={handleEditProject}
        onMobileClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          height: '100%',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            flex: 1, 
            overflow: 'hidden' 
          }}
        >
          {/* Note List Panel */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '320px' },
              height: { xs: '40%', md: 'calc(100% - 64px)' },
              borderRight: { md: 1 },
              borderBottom: { xs: 1, md: 'none' },
              borderColor: 'divider',
              overflow: 'auto',
            }}
          >
            <NoteList />
          </Box>
          
          {/* Note Editor Panel */}
          <Box 
            sx={{ 
              flex: 1, 
              height: { xs: '60%', md: 'calc(100% - 64px)' },
              overflow: 'auto',
            }}
          >
            <NoteEditor />
          </Box>
        </Box>
      </Box>

      {/* Project Dialog */}
      <ProjectDialog 
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        project={currentProject}
      />
      
      {/* Notification */}
      {notification && (
        <NotificationBar 
          open={!!notification}
          message={notification.message}
          severity={notification.type}
          onClose={hideNotification}
        />
      )}
    </Box>
  );
};

export default Layout; 