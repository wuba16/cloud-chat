// src/lib/storage.js
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/** Upload a file to Cloud Storage and return its download URL.
 *
 *  @param roomId      — Firestore room ID (scopes the storage path)
 *  @param msgId       — message document ID (pre-generated)
 *  @param file        — File object from <input type="file">
 *  @param onProgress  — optional callback(0-100) for progress bars
 *  @returns Promise<{ url, name, size, type }>
 */
export function uploadAttachment(roomId, msgId, file, onProgress) {
  return new Promise((resolve, reject) => {
    const path    = `rooms/${roomId}/${msgId}/${file.name}`;
    const fileRef = ref(storage, path);
    const task    = uploadBytesResumable(fileRef, file);

    task.on('state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, name: file.name, size: file.size, type: file.type });
      }
    );
  });
}