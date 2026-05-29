import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login    from './components/Login';
import RoomList from './components/RoomList';
import ChatView from './components/ChatView';
import './index.css';

function AppInner() {
  const { user }           = useAuth();
  const [roomId, setRoomId] = useState(null);

  if (!user) return <Login />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <RoomList activeRoomId={roomId} onSelectRoom={setRoomId} />
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