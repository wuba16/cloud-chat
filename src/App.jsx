import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login    from './components/Login';
import RoomList from './components/RoomList';
import ChatView from './components/ChatView';
import './index.css';

// Inner app — only rendered when AuthProvider knows user state
function AppInner() {
  const { user }              = useAuth();
  const [roomId, setRoomId]   = useState(null);

  // Not signed in → show Login screen
  if (!user) return <Login />;

  // Signed in → show sidebar + chat
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <RoomList
        activeRoomId={roomId}
        onSelectRoom={setRoomId}
      />
      <ChatView roomId={roomId} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}