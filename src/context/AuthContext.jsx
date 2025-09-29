// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

// Create the context
const AuthContext = createContext(null);

// Create a custom hook to make it easy to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To check if auth state is loaded

  useEffect(() => {
    // This is a listener from Firebase that runs whenever the auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // We're done loading the auth state
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, []); // The empty array ensures this effect runs only once

  const value = {
    currentUser,
  };

  // We don't render anything until we're sure if a user is logged in or not
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}