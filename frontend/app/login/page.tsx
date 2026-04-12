'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleError = (err: any) => {
    console.error('Auth error:', err);
    const msg = err.response?.data?.error || err.message || 'Authentication failed.';
    setError(msg);
  };

  // ✅ GOOGLE LOGIN
  const handleGoogleSignIn = async () => {
    setLoading(true); setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;

      // ✅ FIXED ROUTE
      await api.post('/api/auth/register', {
        firebaseUid: user.uid,
        email: user.email,
        role: 'citizen',
        name: user.displayName ?? 'Citizen',
        photoURL: user.photoURL,
      });

      router.push('/dashboard/user');
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ EMAIL LOGIN
  const handleEmailLogin = async () => {
    if (!email || !password) return setError('Email and password are required');

    setLoading(true); setError(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // ✅ FIXED ROUTE
      await api.post('/api/auth/register', {
        firebaseUid: result.user.uid,
        email: result.user.email,
        role: selectedRole,
        name: result.user.displayName || 'User',
      });

      router.push('/dashboard/user');
    } catch (err: any) {
      await signOut(auth);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleGoogleSignIn} disabled={loading}>
        Login with Google
      </button>

      <hr />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleEmailLogin} disabled={loading}>
        Login
      </button>
    </div>
  );
}
