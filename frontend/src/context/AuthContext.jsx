import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  };

  const fetchDbUser = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
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
    const unsub = onAuthStateChanged(auth, async (user) => {
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
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchDbUser(cred.user);
    return cred.user;
  };

  const register = async (email, password, displayName, role = 'client') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const token = await cred.user.getIdToken();
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ displayName, role }),
    });
    await fetchDbUser(cred.user);
    return cred.user;
  };

  const logout = async () => {
    await signOut(auth);
    setDbUser(null);
  };

  const refreshUser = async () => {
    if (firebaseUser) await fetchDbUser(firebaseUser);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, dbUser, loading, login, register, logout, getToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
