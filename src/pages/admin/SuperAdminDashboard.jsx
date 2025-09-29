// src/pages/admin/SuperAdminDashboard.jsx

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

function SuperAdminDashboard() {
  const { currentUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminSchool, setAdminSchool] = useState(null);

  useEffect(() => {
    const fetchSchoolAndPendingUsers = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Step 1: Fetch the logged-in super admin's school
        const adminDocRef = doc(db, 'users', currentUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);

        let schoolOfAdmin = null;
        if (adminDocSnap.exists()) {
          schoolOfAdmin = adminDocSnap.data().school;
          setAdminSchool(schoolOfAdmin);
        } else {
          console.error("Super Admin user document not found!");
          setIsLoading(false);
          return;
        }

        if (!schoolOfAdmin) {
            console.error("Super Admin's school is not set in their profile!");
            setIsLoading(false);
            return;
        }

        // Step 2: Query for ALL pending users (Admins, Students, Parents) from that school
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef, 
            where('status', '==', 'pending'),
            where('school', '==', schoolOfAdmin) // Now finds all user types
        );

        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingUsers(users);
      } catch (error) {
        console.error("Error fetching pending users: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolAndPendingUsers();
  }, [currentUser]);

  const handleApprove = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        status: 'approved'
      });
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId)); 
    } catch (error) {
      console.error("Error approving user: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Approve new accounts for: <span className="font-semibold">{adminSchool || 'Loading...'}</span>
      </p>

      <div className="mt-8 bg-white shadow-xl rounded-2xl">
        <h2 className="text-xl font-bold text-gray-900 p-6 border-b">Pending Approval Requests</h2>
        {isLoading ? (
          <p className="p-6">Loading requests...</p>
        ) : pendingUsers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {pendingUsers.map(user => (
              <li key={user.id} className="p-6 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {/* NEW: Display the user's role/type */}
                  <p className="text-sm text-gray-500">
                    Account Type: <span className="font-medium">{user.role || user.userType}</span>
                  </p>
                  {user.department && <p className="text-sm text-gray-500">Department: {user.department}</p>}
                  <p className="text-sm font-medium text-blue-600 mt-1">School: {user.school}</p>
                </div>
                <button
                  onClick={() => handleApprove(user.id)}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-gray-500">There are no pending requests for this school.</p>
        )}
      </div>
    </div>
  );
}

export default SuperAdminDashboard;