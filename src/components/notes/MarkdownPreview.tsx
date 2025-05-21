import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Box, useTheme } from '@mui/material';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className }) => {
  const theme = useTheme();
  
  return (
    <Box 
      className={`markdown-preview ${className || ''}`}
      sx={{ 
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.paper,
        height: '100%',
        padding: 3,
        overflow: 'auto',
        '& a': {
          color: theme.palette.primary.main,
        },
        '& blockquote': {
          borderLeftColor: theme.palette.primary.light,
          margin: theme.spacing(1, 0, 1, 0),
          padding: theme.spacing(0.5, 0, 0.5, 2),
          borderLeft: `4px solid ${theme.palette.primary.light}`,
        },
        '& img': {
          maxWidth: '100%',
          borderRadius: theme.shape.borderRadius,
        },
        '& pre': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.04)',
          padding: theme.spacing(2),
          borderRadius: theme.shape.borderRadius,
          overflowX: 'auto',
        },
        '& code': {
          fontFamily: 'monospace',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.06)',
          padding: theme.spacing(0.5, 1),
          borderRadius: theme.shape.borderRadius / 2,
          fontSize: '0.9em',
        },
        '& h1, & h2': {
          borderBottom: `1px solid ${
            theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)'
          }`,
          paddingBottom: theme.spacing(0.5),
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          marginBottom: theme.spacing(2),
        },
        '& th, & td': {
          border: `1px solid ${
            theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)'
          }`,
          padding: theme.spacing(1, 2),
        },
        '& th': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownPreview; 