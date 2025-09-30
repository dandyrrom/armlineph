// src/hooks/useUserInfo.js

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

// This is our custom hook
export function useUserInfo() {
  const { currentUser } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This function fetches the user's document from Firestore
    const fetchUserInfo = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            // We found the user's data, let's store it
            setUserInfo(docSnap.data());
          } else {
            // The user is authenticated, but we don't have their data
            setUserInfo(null);
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
          setUserInfo(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No user is logged in
        setIsLoading(false);
        setUserInfo(null);
      }
    };

    fetchUserInfo();
  }, [currentUser]); // This effect re-runs whenever the currentUser changes

  // The hook returns the user's data and a loading state
  return { userInfo, isLoading };
}