// src/components/AdminRoute.jsx

import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import LoadingSpinner from './LoadingSpinner'; // --- 1. IMPORT THE SPINNER ---

function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        // This is the key check: is the role 'admin' OR 'superAdmin'?
        if (docSnap.exists() && (docSnap.data().role === 'admin' || docSnap.data().role === 'superAdmin')) {
          setIsAdmin(true);
        }
      }
      setIsLoading(false);
    };
    checkRole();
  }, [currentUser]);

  if (isLoading) {
    // --- 2. USE THE SPINNER COMPONENT ---
    return (
        <div className="flex-grow flex items-center justify-center">
            <LoadingSpinner message="Checking permissions..." />
        </div>
    );
  }

  if (!currentUser || !isAdmin) {
    // If not logged in OR not an admin/superAdmin, redirect
    return <Navigate to="/admin/login" />;
  }

  return children; // If all checks pass, show the protected page
}

export default AdminRoute;

