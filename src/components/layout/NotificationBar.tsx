import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface NotificationBarProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({
  open,
  message,
  severity,
  onClose
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity} 
        sx={{ 
          width: '100%',
          boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.12)',
          borderRadius: 2,
        }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationBar; 