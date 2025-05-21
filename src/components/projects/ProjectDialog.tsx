import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  useTheme,
  IconButton,
} from '@mui/material';
import { Project } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { PROJECT_COLORS } from '../../utils/formatUtils';
import CheckIcon from '@mui/icons-material/Check';

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({ open, onClose, project }) => {
  const theme = useTheme();
  const { dispatch } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [error, setError] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name);
        setDescription(project.description || '');
        setColor(project.color || PROJECT_COLORS[0]);
      } else {
        setName('');
        setDescription('');
        setColor(PROJECT_COLORS[0]);
      }
      setError('');
    }
  }, [open, project]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (project) {
      // Update existing project
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: {
          ...project,
          name,
          description: description || undefined,
          color,
        },
      });
    } else {
      // Add new project
      dispatch({
        type: 'ADD_PROJECT',
        payload: {
          name,
          description: description || undefined,
          color,
        },
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {project ? 'Edit Project' : 'Create New Project'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Project Name"
            fullWidth
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setError('');
            }}
            error={!!error}
            helperText={error}
            autoFocus
            margin="dense"
          />
          <TextField
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Project Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {PROJECT_COLORS.map((colorOption) => (
                <IconButton
                  key={colorOption}
                  onClick={() => setColor(colorOption)}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: colorOption,
                    color: 'white',
                    '&:hover': {
                      bgcolor: colorOption,
                      opacity: 0.9,
                    },
                    border: color === colorOption ? '2px solid white' : 'none',
                    boxShadow: color === colorOption ? `0 0 0 2px ${theme.palette.primary.main}` : 'none',
                  }}
                >
                  {color === colorOption && <CheckIcon fontSize="small" />}
                </IconButton>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!name.trim()}
        >
          {project ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog; 