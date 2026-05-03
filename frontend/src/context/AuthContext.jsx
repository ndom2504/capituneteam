import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase.js';
import { apiFetch } from '../config/api.js';
import * as firebaseAuth from 'firebase/auth';

const demoMode = !auth;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    if (demoMode) return 'demo-token';
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  };

  const fetchDbUser = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await apiFetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data);
      } else {
        setDbUser(null);
      }
    } catch {
      setDbUser(null);
    }
  };

  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      return;
    }
    const unsub = firebaseAuth.onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchDbUser(user);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    if (demoMode) {
      const demoUser = { uid: 'demo', email, displayName: 'Demo User' };
      setFirebaseUser(demoUser);
      setDbUser({ id: 1, firebase_uid: 'demo', email, display_name: 'Demo User', role: 'client' });
      return demoUser;
    }
    const cred = await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
    await fetchDbUser(cred.user);
    return cred.user;
  };

  const register = async (email, password, displayName, role = 'client') => {
    if (demoMode) {
      const demoUser = { uid: 'demo', email, displayName };
      setFirebaseUser(demoUser);
      setDbUser({ id: 1, firebase_uid: 'demo', email, display_name: displayName, role });
      return demoUser;
    }
    const cred = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
    await firebaseAuth.updateProfile(cred.user, { displayName });
    const token = await cred.user.getIdToken();
    await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ displayName, role }),
    });
    await fetchDbUser(cred.user);
    return cred.user;
  };

  const loginWithGoogle = async (role = 'client') => {
    if (demoMode) {
      const demoUser = { uid: 'demo-google', email: 'demo@google.com', displayName: 'Demo Google' };
      setFirebaseUser(demoUser);
      setDbUser({ id: 2, firebase_uid: 'demo-google', email: 'demo@google.com', display_name: 'Demo Google', role });
      return { user: demoUser, isNew: true };
    }
    const cred = await firebaseAuth.signInWithPopup(auth, googleProvider);
    const token = await cred.user.getIdToken();

    // Check if user exists in our DB
    const res = await apiFetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setDbUser(data);
      setFirebaseUser(cred.user);
      return { user: cred.user, isNew: false };
    }

    // New user - register with chosen role
    await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        displayName: cred.user.displayName || cred.user.email.split('@')[0],
        role,
      }),
    });
    await fetchDbUser(cred.user);
    setFirebaseUser(cred.user);
    return { user: cred.user, isNew: true };
  };

  const logout = async () => {
    if (demoMode) {
      setFirebaseUser(null);
      setDbUser(null);
      return;
    }
    await firebaseAuth.signOut(auth);
    setDbUser(null);
  };

  const refreshUser = async () => {
    if (firebaseUser) await fetchDbUser(firebaseUser);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, dbUser, loading, login, register, loginWithGoogle, logout, getToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
