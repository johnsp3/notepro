import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { Note } from '../../types';

// In a real app, this would be your actual domain
const APP_DOMAIN = 'https://notepro.example.com';

interface ShareNoteDialogProps {
  open: boolean;
  onClose: () => void;
  note: Note | null;
}

const ShareNoteDialog: React.FC<ShareNoteDialogProps> = ({ open, onClose, note }) => {
  const [isPublic, setIsPublic] = useState(true);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  
  if (!note) {
    return null;
  }
  
  // Generate share URL - in a real app, this would include a unique token or ID
  const shareUrl = `${APP_DOMAIN}/shared/${note.id}`;
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCopiedAlert(true);
  };
  
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out my note: ${note.title}`);
    const body = encodeURIComponent(`I wanted to share this note with you: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out my note: ${note.title} ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`);
  };
  
  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };
  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShareIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Share Note</Typography>
            </Box>
            <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            "{note.title}"
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                {isPublic ? 'Anyone with the link can view this note' : 'Only you can view this note'}
              </Typography>
            }
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            fullWidth
            variant="outlined"
            value={shareUrl}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton color="primary" onClick={handleCopyToClipboard} size="small">
                  <CopyIcon />
                </IconButton>
              ),
            }}
            helperText={isPublic ? "Copy this link to share your note" : "Enable public sharing first"}
            disabled={!isPublic}
            size="small"
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Share via:
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <IconButton 
              color="primary" 
              onClick={handleEmailShare}
              disabled={!isPublic}
              sx={{ 
                bgcolor: 'rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } 
              }}
            >
              <EmailIcon />
            </IconButton>
            
            <IconButton 
              onClick={handleTwitterShare}
              disabled={!isPublic} 
              sx={{ 
                color: '#1DA1F2',
                bgcolor: 'rgba(29,161,242,0.1)',
                '&:hover': { bgcolor: 'rgba(29,161,242,0.2)' } 
              }}
            >
              <TwitterIcon />
            </IconButton>
            
            <IconButton 
              onClick={handleFacebookShare}
              disabled={!isPublic}
              sx={{ 
                color: '#4267B2',
                bgcolor: 'rgba(66,103,178,0.1)',
                '&:hover': { bgcolor: 'rgba(66,103,178,0.2)' } 
              }}
            >
              <FacebookIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            {isPublic 
              ? 'Note: Anyone with this link will be able to view (but not edit) this note.' 
              : 'Enable public sharing to generate a link that others can use to view this note.'}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} color="primary" sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={showCopiedAlert}
        autoHideDuration={3000}
        onClose={() => setShowCopiedAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowCopiedAlert(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareNoteDialog; 