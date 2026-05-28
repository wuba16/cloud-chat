import { useEffect, useRef, useState } from 'react';
import { watchMessages, sendMessage, markAsRead } from '../lib/chat';
import { getRoom } from '../lib/chat';
import { useAuth } from '../contexts/AuthContext';

export default function ChatView({ roomId }) {
  const { user }              = useAuth();
  const [room, setRoom]       = useState(null);
  const [messages, setMsgs]   = useState([]);
  const [text, setText]       = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef             = useRef(null);

  // Load room details once
  useEffect(() => {
    if (!roomId) return;
    getRoom(roomId).then(setRoom);
  }, [roomId]);

  // Real-time message listener
  useEffect(() => {
    if (!roomId) return;
    const unsub = watchMessages(roomId, (msgs) => {
      setMsgs(msgs);
      // Mark latest message as read
      const unread = msgs.filter(m => !m.readBy?.includes(user.uid));
      unread.forEach(m => markAsRead(roomId, m.id, user.uid));
    });
    return unsub;
  }, [roomId, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText('');
    try {
      await sendMessage(roomId, user.uid, t);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  const initials = (uid) => uid.slice(0, 2).toUpperCase();

  const formatTime = (date) => date instanceof Date
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '';

  if (!roomId) return (
    <div style={S.empty}>
      <p style={S.emptyText}>Select a room to start chatting</p>
    </div>
  );

  return (
    <div style={S.wrap}>

      // Header
      <div style={S.header}>
        <span style={S.hash}>#</span>
        <span style={S.roomName}>{room?.name || '…'}</span>
        <span style={S.memberCount}>{room?.members?.length || 0} members</span>
      </div>

      // Messages
      <div style={S.messages}>
        {messages.length === 0 && (
          <p style={S.noMsgs}>No messages yet. Say hello!</p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user.uid;
          const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
          return (
            <div key={msg.id} style={{ ...S.msgRow, ...(isMe ? S.msgRowMe : {}) }}>
              {!isMe && (
                <div style={{ ...S.avatar, opacity: showAvatar ? 1 : 0 }}>
                  {initials(msg.senderId)}
                </div>
              )}
              <div style={S.msgGroup}>
                <div style={{ ...S.bubble, ...(isMe ? S.bubbleMe : S.bubbleThem) }}>
                  {msg.text}
                </div>
                <div style={{ ...S.time, ...(isMe ? { textAlign: 'right' } : {}) }}>
                  {formatTime(msg.createdAt)}
                  {isMe && <span style={S.readReceipt}>
                    {msg.readBy?.length > 1 ? ' · Read' : ' · Sent'}
                  </span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      // Input
      <form onSubmit={handleSend} style={S.inputArea}>
        <div style={S.inputWrap}>
          <textarea
            style={S.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${room?.name || '…'}`}
            rows={1}
            maxLength={1000}
          />
          <button type="submit" style={S.sendBtn} disabled={!text.trim() || sending}>
            Send
          </button>
        </div>
        <p style={S.hint}>Enter to send · Shift+Enter for new line</p>
      </form>

    </div>
  );
}

const S = {
  wrap:         { flex: '1', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  empty:        { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyText:    { color: 'var(--text3)', fontSize: '14px' },
  header:       { padding: '0 20px', height: '52px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', flexShrink: '0' },
  hash:         { fontFamily: 'var(--mono)', fontSize: '18px', color: 'var(--accent2)' },
  roomName:     { fontSize: '14px', fontWeight: '500', color: 'var(--text)', flex: '1' },
  memberCount:  { fontSize: '12px', color: 'var(--text3)' },
  messages:     { flex: '1', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' },
  noMsgs:       { color: 'var(--text3)', fontSize: '13px', textAlign: 'center', padding: '40px 0' },
  msgRow:       { display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '10px' },
  msgRowMe:     { flexDirection: 'row-reverse' },
  avatar:       { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--surface2)', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500', flexShrink: '0' },
  msgGroup:     { display: 'flex', flexDirection: 'column', maxWidth: '65%' },
  bubble:       { padding: '9px 13px', borderRadius: '12px', fontSize: '13.5px', lineHeight: '1.55', wordBreak: 'break-word' },
  bubbleThem:   { background: 'var(--surface)', color: 'var(--text)', borderRadius: '12px 12px 12px 3px' },
  bubbleMe:     { background: 'var(--accent)', color: '#fff', borderRadius: '12px 12px 3px 12px' },
  time:         { fontSize: '10px', color: 'var(--text3)', marginTop: '3px', paddingLeft: '2px' },
  readReceipt:  { color: 'var(--accent2)' },
  inputArea:    { padding: '12px 16px 16px', borderTop: '0.5px solid var(--border)', background: 'var(--surface)', flexShrink: '0' },
  inputWrap:    { display: 'flex', alignItems: 'flex-end', gap: '8px', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '8px 12px' },
  textarea:     { flex: '1', background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '13.5px', resize: 'none', maxHeight: '80px', lineHeight: '1.5', padding: '2px 0' },
  sendBtn:      { background: 'var(--accent)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '13px', fontWeight: '500', padding: '7px 14px', flexShrink: '0' },
  hint:         { fontSize: '11px', color: 'var(--text3)', marginTop: '6px', paddingLeft: '4px' },
};