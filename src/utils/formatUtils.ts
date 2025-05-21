import { NoteFormat } from '../types';

// Format date to human-readable string
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format relative time (e.g., "5 minutes ago")
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else {
    return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  }
};

// Get icon name for note format
export const getFormatIconName = (format: NoteFormat): string => {
  switch (format) {
    case 'text':
      return 'article';
    case 'markdown':
      return 'description';
    case 'code':
      return 'code';
    case 'task':
      return 'check_box';
    case 'link':
      return 'link';
    default:
      return 'note';
  }
};

// Get color for note format
export const getFormatColor = (format: NoteFormat): string => {
  switch (format) {
    case 'text':
      return '#3f51b5'; // primary
    case 'markdown':
      return '#009688'; // teal
    case 'code':
      return '#ff9800'; // orange
    case 'task':
      return '#4caf50'; // green
    case 'link':
      return '#2196f3'; // blue
    default:
      return '#9e9e9e'; // grey
  }
};

// Project colors
export const PROJECT_COLORS = [
  '#3f51b5', // primary blue
  '#f44336', // red
  '#4caf50', // green
  '#ff9800', // orange
  '#9c27b0', // purple
  '#009688', // teal
  '#795548', // brown
  '#607d8b', // blue grey
]; 