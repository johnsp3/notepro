import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Firebase Storage
 * @param file The file to upload
 * @param path Optional path within storage
 * @returns URL of the uploaded file
 */
export const uploadFile = async (file: File, path = 'notes'): Promise<string> => {
  try {
    // Create a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get and return the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file to storage');
  }
};

/**
 * Deletes a file from Firebase Storage
 * @param fileUrl The URL of the file to delete
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    // This is a simplified approach and may need to be adjusted
    const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET}/o/`;
    const filePathEncoded = fileUrl.replace(baseUrl, '').split('?')[0];
    const filePath = decodeURIComponent(filePathEncoded);
    
    // Delete the file
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file from storage');
  }
}; 