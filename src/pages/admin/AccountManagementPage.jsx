// src/pages/admin/AccountManagementPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner'; // --- 1. IMPORT THE SPINNER ---

function AccountManagementPage() {
  const { currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminSchool, setAdminSchool] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);

    // Fetch admin school (can remain a one-time fetch)
    const adminDocRef = doc(db, 'users', currentUser.uid);
    getDoc(adminDocRef).then(adminDocSnap => {
      const schoolOfAdmin = adminDocSnap.exists() ? adminDocSnap.data().school : null;
      if (schoolOfAdmin) {
        setAdminSchool(schoolOfAdmin);

        // --- REAL-TIME LISTENER FOR USERS ---
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('school', '==', schoolOfAdmin));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAllUsers(users);
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching real-time users: ", error);
          setIsLoading(false);
        });

        return unsubscribe; // This will be returned by the .then() block
      }
    }).then(unsubscribe => {
      // Return the unsubscribe function from the main useEffect
      return () => {
        if (unsubscribe) unsubscribe();
      };
    });
  }, [currentUser]);

  const filteredUsers = useMemo(() => {
    return allUsers
      .filter(user => {
        // Status filter
        if (filterStatus !== 'all' && user.status !== filterStatus) {
          return false;
        }
        // Search filter
        if (searchTerm &&
            !user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      })
      // --- NEW SORTING LOGIC START ---
      .sort((a, b) => {
        // Safely get timestamp seconds, default to null or 0 if not present
        const statusA = a.statusUpdatedAt?.seconds ?? null;
        const statusB = b.statusUpdatedAt?.seconds ?? null;
        const createdA = a.createdAt?.seconds ?? 0;
        const createdB = b.createdAt?.seconds ?? 0;

        switch (filterStatus) {
          case 'pending':
            // Sort pending requests by creation date, newest first
            return createdB - createdA;

          case 'approved':
          case 'rejected':
            // Sort approved/rejected by status update date, newest first
            // If one is missing the update date (older record), prioritize the one with it
            if (statusA && statusB) {
              return statusB - statusA; // Both have update time, sort by it
            } else if (statusA && !statusB) {
              return -1; // a has update time, b doesn't -> a comes first
            } else if (!statusA && statusB) {
              return 1; // b has update time, a doesn't -> b comes first
            } else {
              // Neither has update time (older records), sort by creation date
              return createdB - createdA;
            }

          case 'all':
          default:
            // Sort 'all' primarily by status update date (newest first)
            // Group pending users (no statusUpdatedAt) at the bottom, sorted by creation date (newest first)

            // Prioritize users with a status update time
            if (statusA && !statusB) return -1; // a (approved/rejected) comes before b (pending)
            if (!statusA && statusB) return 1;  // b (approved/rejected) comes before a (pending)

            if (statusA && statusB) {
              // Both have status update time, sort by it (descending)
              return statusB - statusA;
            } else {
              // Neither has status update time (both pending or very old), sort by creation date (descending)
              return createdB - createdA;
            }
        }
      });
      // --- NEW SORTING LOGIC END ---
  }, [allUsers, filterStatus, searchTerm]); // Dependencies remain the same

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { status: newStatus });
      setAllUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error("Error updating user status: ", error);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Account Management</h1>
        <p className="mt-1 text-sm text-gray-600">Managing accounts for: <span className="font-semibold">{adminSchool || '...'}</span></p>
      </div>

      <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row gap-4">
        {/* --- NEW SEARCH BAR --- */}
        <div className="flex-1">
          <label htmlFor="user-search" className="text-sm font-medium text-gray-700">Search by Name/Email</label>
          <input
            id="user-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Filter by status</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        // --- 2. USE THE SPINNER COMPONENT ---
        <div className="p-6">
            <LoadingSpinner message="Loading accounts..." />
        </div>
      ) : filteredUsers.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map(user => (
            <li key={user.id}>
              <Link to={`/admin/accounts/${user.id}`} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-800">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Role: <span className="font-medium capitalize">{user.role || user.userType || 'N/A'}</span>
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-medium uppercase rounded-full ${
                    user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    user.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                  <span className="text-gray-400 text-sm hidden md:inline">&rarr;</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-6 text-gray-500">No accounts match the current filter.</p>
      )}
    </div>
  );
}

export default AccountManagementPage;

