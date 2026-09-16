import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users] = useState(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sprintflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return MOCK_USERS[0]; // Alex Chen (Lead Architect / Admin)
  });

  useEffect(() => {
    localStorage.setItem('sprintflow_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchUser = (userId) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
