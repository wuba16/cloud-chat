// src/lib/chat.js  — all Firestore operations
import {
  collection, doc, addDoc, getDoc,
  updateDoc, query, orderBy, onSnapshot,
  serverTimestamp, arrayUnion, limit
} from 'firebase/firestore';
import { db } from './firebase';

// ── ROOMS ────────────────────────────────────────────

/** Create a new room. Returns the new roomId. */
export async function createRoom(name, creatorUid, memberUids = []) {
  const members = [...new Set([creatorUid, ...memberUids])];
  const ref = await addDoc(collection(db, 'rooms'), {
    name,
    members,
    createdBy:   creatorUid,
    createdAt:   serverTimestamp(),
    lastMessage: null,
  });
  return ref.id;
}

/** Get a single room by ID (one-time read). */
export async function getRoom(roomId) {
  const snap = await getDoc(doc(db, 'rooms', roomId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Real-time listener — fires every time rooms change.
 *  Filters to only rooms where uid is a member.
 *  Returns unsubscribe function — call it to stop. */
export function watchUserRooms(uid, cb) {
  return onSnapshot(collection(db, 'rooms'), (snap) => {
    const rooms = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.members?.includes(uid));
    cb(rooms);
  });
}

// ── MESSAGES ─────────────────────────────────────────

/** Send a plain-text message to a room. */
export async function sendMessage(roomId, senderId, text) {
  const msgsRef = collection(db, `rooms/${roomId}/messages`);
  const msgRef  = await addDoc(msgsRef, {
    text,
    senderId,
    createdAt:   serverTimestamp(),
    readBy:      [senderId],
    attachments: [],
  });
  await updateDoc(doc(db, 'rooms', roomId), {
    lastMessage: { text: text.slice(0, 60), senderId, at: serverTimestamp() },
  });
  return msgRef.id;
}

/** Send a message that includes file attachments.
 *  Call uploadAttachment() first to get attachment objects. */
export async function sendMessageWithAttachments(roomId, senderId, text, attachments) {
  const msgsRef = collection(db, `rooms/${roomId}/messages`);
  const msgRef  = await addDoc(msgsRef, {
    text: text || '',
    senderId,
    createdAt:   serverTimestamp(),
    readBy:      [senderId],
    attachments,
  });
  const preview = attachments.length > 0 ? 'Attachment' : text.slice(0, 60);
  await updateDoc(doc(db, 'rooms', roomId), {
    lastMessage: { text: preview, senderId, at: serverTimestamp() },
  });
  return msgRef.id;
}

/** Real-time listener for messages in a room, newest last.
 *  Returns unsubscribe function. */
export function watchMessages(roomId, cb) {
  const q = query(
    collection(db, `rooms/${roomId}/messages`),
    orderBy('createdAt', 'asc'),
    limit(100),
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
    }));
    cb(msgs);
  });
}

/** Mark a message as read. Adds uid to readBy[] if not already there. */
export async function markAsRead(roomId, msgId, uid) {
  await updateDoc(
    doc(db, `rooms/${roomId}/messages`, msgId),
    { readBy: arrayUnion(uid) },
  );
}