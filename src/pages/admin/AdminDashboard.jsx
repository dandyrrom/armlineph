// src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminSchool, setAdminSchool] = useState(null);

  useEffect(() => {
    const fetchAdminAndReports = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const adminDocRef = doc(db, 'users', currentUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);

        const schoolOfAdmin = adminDocSnap.exists() ? adminDocSnap.data().school : null;
        if (schoolOfAdmin) {
          setAdminSchool(schoolOfAdmin);
          const reportsRef = collection(db, 'reports');
          const q = query(reportsRef, where('school', '==', schoolOfAdmin));
          const querySnapshot = await getDocs(q);
          const filteredReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReports(filteredReports);
        } else {
          console.error("Admin user document not found or school is not set.");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminAndReports();
  }, [currentUser]);

  const handleReportClick = (reportId) => {
    navigate(`/admin/report/${reportId}`);
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Incoming Reports</h1>
        <p className="mt-1 text-sm text-gray-600">Viewing reports for: <span className="font-semibold">{adminSchool || '...'}</span></p>
      </div>

      {isLoading ? (
        <p className="p-6 text-gray-500">Loading reports...</p>
      ) : reports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                {/* NEW COLUMN: Added for Submitter Type */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map(report => (
                <tr 
                  key={report.id} 
                  onClick={() => handleReportClick(report.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{report.caseId}</td>
                  {/* NEW CELL: Displays Anonymous or Verified User based on the isAnonymous flag */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.isAnonymous 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {report.isAnonymous ? 'Anonymous User' : 'Verified User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{report.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.createdAt.seconds * 1000).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-6 text-gray-500">There are no reports for this school.</p>
      )}
    </div>
  );
}

export default AdminDashboard;