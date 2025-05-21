import Dexie from 'dexie';
import { Note } from '../types';

class NotesDatabase extends Dexie {
  notes!: Dexie.Table<Note, string>;
  
  constructor() {
    super('NotesDatabase');
    this.version(1).stores({
      notes: 'id, projectId, createdAt, updatedAt'
    });
  }
}

const db = new NotesDatabase();

// Database operations
export async function saveNote(note: Note) {
  return db.notes.put(note);
}

export async function getNoteById(id: string) {
  return db.notes.get(id);
}

export async function getNotesByProject(projectId: string) {
  return db.notes.where('projectId').equals(projectId).toArray();
}

export async function getAllNotes() {
  return db.notes.toArray();
}

export async function deleteNote(id: string) {
  return db.notes.delete(id);
}

export default db; 