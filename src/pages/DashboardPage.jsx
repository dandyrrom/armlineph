// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // NEW STATE: For storing user's first name
  const [userFirstName, setUserFirstName] = useState('');

  useEffect(() => {
    const fetchUserDataAndReports = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      try {
        // NEW: Fetch user document to get fullName
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // Extract first name from fullName
          const firstName = userData.fullName.split(' ')[0];
          setUserFirstName(firstName);
        }

        // Existing reports fetching logic
        const reportsRef = collection(db, 'reports');
        const q = query(
          reportsRef,
          where('submittedById', '==', currentUser.uid),
        );

        const querySnapshot = await getDocs(q);
        const userReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReports(userReports);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndReports();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
          {/* UPDATED: Show first name instead of email */}
          <p className="mt-1 text-gray-600">
            Welcome, {userFirstName || 'there'}!
          </p>
        </div>
        <Link to="/submit-report" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
          Submit New Report
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-8 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Submitted Reports</h2>
        {isLoading ? (
          <p>Loading your reports...</p>
        ) : reports.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
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
                      <span className="px-3 py-1 text-sm font-medium uppercase rounded-full bg-yellow-100 text-yellow-800">
                        {report.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not submitted any reports yet.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;