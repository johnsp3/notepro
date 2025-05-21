import React from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 3
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to NotePro
          </Typography>
          
          <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 4 }}>
            Your personal note-taking application. Sign in to access your notes and projects.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            sx={{ 
              padding: '10px 30px',
              borderRadius: '30px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 