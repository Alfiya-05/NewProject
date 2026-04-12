'use client';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export function useAuth() {
  const { user, setUser, setLoading, loading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await api.get('/auth/me');
          const token = await firebaseUser.getIdToken();
          setUser({ ...res.data.user, token });
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return { user, loading };
}
