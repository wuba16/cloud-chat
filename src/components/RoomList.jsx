import { useEffect, useState } from 'react';
import { watchUserRooms, createRoom } from '../lib/chat';
import { useAuth } from '../contexts/AuthContext';

export default function RoomList({ activeRoomId, onSelectRoom }) {
  const { user, logout }    = useAuth();
  const [rooms, setRooms]   = useState([]);
  const [newName, setName]  = useState('');
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = watchUserRooms(user.uid, setRooms);
    return unsub;
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const roomId = await createRoom(name, user.uid);
      setName('');
      setShowInput(false);
      onSelectRoom(roomId);
    } finally {
      setCreating(false);
    }
  };

  const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?';

  return (
    <aside style={S.sidebar}>
      <div style={S.header}>
        <span style={S.logo}><span style={S.dot}/>CloudChat</span>
        <button style={S.iconBtn} title="New room" onClick={() => setShowInput(!showInput)}>+</button>
      </div>

      {showInput && (
        <form onSubmit={handleCreate} style={S.newRoomForm}>
          <input
            style={S.newRoomInput}
            placeholder="Room name…"
            value={newName}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <button type="submit" style={S.newRoomBtn} disabled={creating}>
            {creating ? '…' : 'Create'}
          </button>
        </form>
      )}

      <div style={S.label}>Channels</div>

      <div style={S.list}>
        {rooms.length === 0 && (
          <p style={S.empty}>No rooms yet. Create one above.</p>
        )}
        {rooms.map(room => (
          <button
            key={room.id}
            style={{ ...S.room, ...(room.id === activeRoomId ? S.roomActive : {}) }}
            onClick={() => onSelectRoom(room.id)}
          >
            <span style={{ ...S.hash, ...(room.id === activeRoomId ? S.hashActive : {}) }}>#</span>
            <span style={S.roomName}>{room.name}</span>
            {room.lastMessage && (
              <span style={S.preview}>
                {room.lastMessage.text.slice(0, 20)}{room.lastMessage.text.length > 20 ? '…' : ''}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={S.userBar}>
        <div style={S.avatar}>{initials(user?.displayName || user?.email || '?')}</div>
        <div style={S.userInfo}>
          <div style={S.userName}>{user?.displayName || user?.email}</div>
          <div style={S.userStatus}>Online</div>
        </div>
        <button style={S.logoutBtn} onClick={logout} title="Sign out">
          Sign out
        </button>
      </div>
    </aside>
  );
}

const S = {
  sidebar:      { width: '220px', minWidth: '220px', background: 'var(--sidebar)', display: 'flex', flexDirection: 'column', borderRight: '0.5px solid var(--border)', height: '100vh' },
  header:       { padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--border)' },
  logo:         { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '14px', color: 'var(--text)' },
  dot:          { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' },
  iconBtn:      { background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', width: '26px', height: '26px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1' },
  newRoomForm:  { padding: '10px 12px', display: 'flex', gap: '6px', borderBottom: '0.5px solid var(--border)' },
  newRoomInput: { flex: '1', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '6px 10px', color: 'var(--text)', fontSize: '13px', outline: 'none' },
  newRoomBtn:   { background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', padding: '6px 10px' },
  label:        { padding: '12px 16px 6px', fontSize: '11px', fontWeight: '500', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' },
  list:         { flex: '1', overflowY: 'auto', padding: '0 8px' },
  empty:        { padding: '12px 8px', fontSize: '12px', color: 'var(--text3)' },
  room:         { width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '7px', background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', marginBottom: '2px', textAlign: 'left' },
  roomActive:   { background: 'var(--surface2)', color: 'var(--text)' },
  hash:         { fontFamily: 'var(--mono)', fontSize: '15px', color: 'var(--text3)', flexShrink: '0' },
  hashActive:   { color: 'var(--accent2)' },
  roomName:     { fontSize: '13px', fontWeight: '500', flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  preview:      { fontSize: '11px', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' },
  userBar:      { padding: '12px', borderTop: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' },
  avatar:       { width: '30px', height: '30px', borderRadius: '50%', background: '#3a2e6e', color: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '500', flexShrink: '0' },
  userInfo:     { flex: '1', minWidth: '0' },
  userName:     { fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' },
  userStatus:   { fontSize: '11px', color: 'var(--online)' },
  logoutBtn:    { background: 'none', border: 'none', color: 'var(--text3)', fontSize: '11px', cursor: 'pointer' },
};