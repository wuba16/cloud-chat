import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const provider = new GoogleAuthProvider();

export default function Login() {
  const [mode, setMode]       = useState('signin'); // 'signin' | 'signup'
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(friendlyError(err.code));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          <div style={styles.logoDot}/>
          <span>CloudChat</span>
        </div>

        <h1 style={styles.heading}>
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <input
              style={styles.input}
              type="text"
              placeholder="Display name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPass(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={styles.divider}><span style={styles.dividerText}>or</span></div>

        <button style={styles.googleBtn} onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={styles.toggle}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            style={styles.toggleBtn}
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':      'No account with that email.',
    'auth/wrong-password':       'Wrong password.',
    'auth/email-already-in-use': 'Email already in use.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Invalid email address.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/invalid-credential':   'Incorrect email or password.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

const styles = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' },
  card:       { width: '100%', maxWidth: '400px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '16px', padding: '36px' },
  logo:       { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '500', marginBottom: '28px', color: 'var(--text)' },
  logoDot:    { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' },
  heading:    { fontSize: '22px', fontWeight: '500', color: 'var(--text)', marginBottom: '24px' },
  error:      { background: 'rgba(244,110,110,0.1)', border: '0.5px solid rgba(244,110,110,0.3)', color: '#f46e6e', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
  form:       { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
  input:      { background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: '8px', padding: '11px 14px', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%' },
  btn:        { background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', fontWeight: '500', width: '100%', marginTop: '4px' },
  divider:    { position: 'relative', textAlign: 'center', margin: '20px 0', borderTop: '0.5px solid var(--border)' },
  dividerText:{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '0 10px', fontSize: '12px', color: 'var(--text3)' },
  googleBtn:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '11px', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '14px' },
  toggle:     { marginTop: '24px', fontSize: '13px', color: 'var(--text2)', textAlign: 'center' },
  toggleBtn:  { background: 'none', border: 'none', color: 'var(--accent2)', fontSize: '13px', cursor: 'pointer' },
};