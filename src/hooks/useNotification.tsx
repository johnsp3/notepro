import { useState, useCallback } from 'react';
import { NoteFormat } from '../types';

interface Notification {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface UseNotificationReturn {
  notification: Notification | null;
  showNotification: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  hideNotification: () => void;
  showFormatDetectedNotification: (format: NoteFormat) => void;
}

const useNotification = (): UseNotificationReturn => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({ message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const showFormatDetectedNotification = useCallback((format: NoteFormat) => {
    const formatMap: Record<NoteFormat, string> = {
      text: 'Plain Text',
      markdown: 'Markdown',
      code: 'Code Snippet',
      task: 'Task List',
      link: 'Web Link',
    };

    showNotification(`Detected format: ${formatMap[format]}`, 'info');
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showFormatDetectedNotification,
  };
};

export default useNotification; 