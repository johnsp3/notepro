import { useCallback } from 'react';

export function useImagePaste(
  onImagePaste: (dataUrl: string) => void
) {
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (!file) continue;
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            onImagePaste(dataUrl);
          };
          reader.readAsDataURL(file);
          event.preventDefault();
          break;
        }
      }
    },
    [onImagePaste]
  );
  
  return handlePaste;
} 