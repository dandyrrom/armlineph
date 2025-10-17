// src/pages/DashboardPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userFirstName, setUserFirstName] = useState('');

  // --- STATE FOR UI CONTROLS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    // Fetch user's first name (can remain a one-time fetch)
    const fetchUserName = async () => {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserFirstName(userDocSnap.data().fullName.split(' ')[0]);
      }
    };
    fetchUserName();

    // --- REAL-TIME LISTENER FOR REPORTS ---
    const reportsRef = collection(db, 'reports');
    
    // --- THIS IS THE FIX ---
    // Query by 'submittedById' which is always present, instead of 'authorId' which is null for anonymous reports.
    const q = query(reportsRef, where('submittedById', '==', currentUser.uid));
    // --- END FIX ---

    // onSnapshot returns an unsubscribe function
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(userReports);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time reports: ", error);
      setIsLoading(false);
    });

    // Return the unsubscribe function to clean up the listener on unmount
    return () => unsubscribe();

  }, [currentUser]);

  // Logic for filtering and sorting reports
  const filteredAndSortedReports = useMemo(() => {
    return reports
      .filter(report => {
        // Search filter (by Case ID)
        const searchMatch = report.caseId && report.caseId.toLowerCase().includes(searchTerm.toLowerCase());
        if (searchTerm && !searchMatch) {
          return false;
        }

        // Status filter
        if (filterStatus !== 'All' && report.status !== filterStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by date
        const dateA = a.createdAt.seconds;
        const dateB = b.createdAt.seconds;
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [reports, searchTerm, filterStatus, sortOrder]); // Dependencies for the calculation

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome, {userFirstName || 'there'}!
          </p>
        </div>
        <Link to="/submit-report" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 text-center">
          Submit New Report
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-8 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Submitted Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="md:col-span-1">
            <label htmlFor="search" className="text-sm font-medium text-gray-700 block mb-1">Search by Case ID</label>
            <input
              type="text"
              id="search"
              placeholder="ARMLN-XX-..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="filterStatus" className="text-sm font-medium text-gray-700 block mb-1">Filter by Status</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option>All</option>
              <option>Submitted</option>
              <option>Under Review</option>
              <option>Action Taken</option>
              <option>Resolved</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
            >
              Sort by Date ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})
            </button>
          </div>
        </div>

        {isLoading ? (
          <p>Loading your reports...</p>
        ) : filteredAndSortedReports.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredAndSortedReports.map((report) => (
              <li key={report.id}>
                <Link to={`/report/${report.id}`} className="block hover:bg-gray-50 p-4 -mx-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-mono text-blue-600 text-sm">{report.caseId || 'N/A'}</p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">{report.category}</p>
                      <p className="text-sm text-gray-500">
                        Submitted on: {new Date(report.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 text-sm font-medium uppercase rounded-full ${
                        report.status === 'Submitted' ? 'bg-gray-100 text-gray-800' :
                        report.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'Action Taken' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">You have not submitted any reports yet, or no reports match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;