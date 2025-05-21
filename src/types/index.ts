export type NoteFormat = 'text' | 'markdown' | 'code' | 'task' | 'link';

// New types for mixed content
export type ContentBlock = TextBlock | ImageBlock;

export interface TextBlock {
  type: 'text';
  id: string; // Unique ID for each block
  content: string;
}

export interface ImageBlock {
  type: 'image';
  id: string; // Unique ID for each block
  dataUrl: string; // Base64 encoded image data
  alt?: string;
  width?: number;
  height?: number;
}

export interface Note {
  id: string;
  title: string;
  // Change from simple string to mixed content array
  content: ContentBlock[];
  format: NoteFormat;
  projectId: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  projects: Project[];
  notes: Note[];
  activeProject: string | null;
  activeNote: string | null;
} 