import React, { useRef } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { ImageOutlined } from '@mui/icons-material';

interface ImageUploaderProps {
  onImageUpload: (dataUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onImageUpload(dataUrl);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button
        variant="outlined"
        startIcon={<ImageOutlined />}
        onClick={handleClick}
        sx={{ 
          textTransform: 'none', 
          mx: 1,
          borderRadius: 2,
          borderColor: 'rgba(0, 0, 0, 0.12)',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          }
        }}
      >
        Add Image
      </Button>
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ display: 'block', mt: 0.5 }}
      >
        or paste an image from clipboard
      </Typography>
    </Box>
  );
};

export default ImageUploader; 