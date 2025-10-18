// src/components/SuperAdminRoute.jsx

import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import LoadingSpinner from './LoadingSpinner'; // --- 1. IMPORT THE SPINNER ---

function SuperAdminRoute({ children }) {
  const { currentUser } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().role === 'superAdmin') {
          setIsSuperAdmin(true);
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
        <LoadingSpinner message="Verifying Super Admin access..." />
      </div>
    );
  }

  if (!currentUser || !isSuperAdmin) {
    // If not logged in OR not a super admin, redirect to admin login
    return <Navigate to="/admin/login" />;
  }

  return children; // If all checks pass, show the protected page
}

export default SuperAdminRoute;

