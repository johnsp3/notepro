import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography,
  useTheme,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { Project } from '../../types';

interface SidebarProps {
  open: boolean;
  width: number;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  width,
  onAddProject,
  onEditProject,
  onMobileClose,
  isMobile = false,
}) => {
  const theme = useTheme();
  const { state, dispatch } = useAppContext();

  const handleProjectClick = (projectId: string) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: projectId });
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? All notes in this project will be deleted as well.')) {
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    }
  };

  const drawer = (
    <>
      <Toolbar />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Projects
        </Typography>
        <Tooltip title="Add Project">
          <IconButton onClick={onAddProject} size="small" sx={{ color: theme.palette.primary.main }}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <List>
        {state.projects.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click the + button to create one
            </Typography>
          </Box>
        ) : (
          state.projects.map((project) => (
            <ListItem 
              key={project.id} 
              disablePadding
              secondaryAction={
                <Box>
                  <Tooltip title="Edit Project">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Project">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => handleDeleteProject(e, project.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemButton
                selected={state.activeProject === project.id}
                onClick={() => handleProjectClick(project.id)}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(63, 81, 181, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(63, 81, 181, 0.16)',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Avatar 
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      bgcolor: project.color || theme.palette.primary.main,
                      fontSize: '0.875rem',
                    }}
                  >
                    {project.name.substring(0, 1).toUpperCase()}
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary={project.name}
                  secondary={
                    <Chip
                      size="small"
                      label={`${state.notes.filter(note => note.projectId === project.id).length} notes`}
                      sx={{ 
                        height: 20, 
                        fontSize: '0.625rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                      }}
                    />
                  }
                  secondaryTypographyProps={{
                    sx: { mt: 0.5 }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onMobileClose}
      ModalProps={{
        keepMounted: true, // Better performance on mobile
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width },
      }}
    >
      {drawer}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        display: { xs: 'none', sm: 'block' },
        width,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width, boxSizing: 'border-box' },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar; 