import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { requestAndSaveFCMToken } from '../lib/notifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(undefined); // undefined = still loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // Request push notification permission after sign-in
      if (firebaseUser) {
        await requestAndSaveFCMToken(firebaseUser.uid);
      }
    });
    return unsub; // cleanup listener on unmount
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component: const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}