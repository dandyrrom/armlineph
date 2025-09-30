// src/pages/admin/AdminDashboard.jsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [allReports, setAllReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminSchool, setAdminSchool] = useState(null);
  const [newReportIds, setNewReportIds] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterUserType, setFilterUserType] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (!currentUser) return;

      const adminDocRef = doc(db, 'users', currentUser.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      const schoolOfAdmin = adminDocSnap.exists() ? adminDocSnap.data().school : null;

      if (schoolOfAdmin) {
        setAdminSchool(schoolOfAdmin);
        return schoolOfAdmin;
      } else {
        console.error("Admin user document not found or school is not set.");
        setIsLoading(false);
        return null;
      }
    };

    fetchAdminInfo().then(schoolOfAdmin => {
      if (!schoolOfAdmin) return;

      const reportsRef = collection(db, 'reports');
      const q = query(reportsRef, where('school', '==', schoolOfAdmin));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedReports = [];
        querySnapshot.forEach(doc => {
          fetchedReports.push({ id: doc.id, ...doc.data() });
        });

        setAllReports(prevReports => {
          if (prevReports.length > 0) {
            const newIds = new Set();
            const prevIds = new Set(prevReports.map(r => r.id));
            for (const report of fetchedReports) {
              if (!prevIds.has(report.id)) {
                newIds.add(report.id);
              }
            }
            if (newIds.size > 0) {
              setNewReportIds(newIds);
              setTimeout(() => setNewReportIds(new Set()), 2000);
            }
          }
          return fetchedReports;
        });

        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching real-time reports: ", error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    });
  }, [currentUser]);

  const filteredAndSortedReports = useMemo(() => {
    return allReports
      .filter(report => {
        if (filterStatus !== 'All' && report.status !== filterStatus) return false;
        if (filterUserType === 'Verified' && report.isAnonymous) return false;
        if (filterUserType === 'Anonymous' && !report.isAnonymous) return false;
        return true;
      })
      .sort((a, b) => {
        if (!a.isAnonymous && b.isAnonymous) return -1;
        if (a.isAnonymous && !b.isAnonymous) return 1;
        const dateA = a.createdAt.seconds;
        const dateB = b.createdAt.seconds;
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [allReports, filterStatus, filterUserType, sortOrder]);

  const handleReportClick = (reportId) => {
    navigate(`/admin/report/${reportId}`);
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Incoming Reports</h1>
        <p className="mt-1 text-sm text-gray-600">Viewing reports for: <span className="font-semibold">{adminSchool || '...'}</span></p>
      </div>
      <div className="p-4 flex flex-col sm:flex-row gap-4 bg-gray-50 border-b">
        <div className="flex-1">
          <label htmlFor="filterStatus" className="text-xs font-medium text-gray-600 block mb-1">Filter by Status</label>
          <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm"><option>All</option><option>Submitted</option><option>Under Review</option><option>Action Taken</option><option>Resolved</option></select>
        </div>
        <div className="flex-1">
          <label htmlFor="filterUserType" className="text-xs font-medium text-gray-600 block mb-1">Filter by User Type</label>
          <select id="filterUserType" value={filterUserType} onChange={(e) => setFilterUserType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm"><option>All</option><option>Verified</option><option>Anonymous</option></select>
        </div>
        <div className="flex items-end">
          <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100">Sort by Date ({sortOrder === 'desc' ? 'Newest' : 'Oldest'})</button>
        </div>
      </div>
      {isLoading ? <p className="p-6 text-gray-500">Loading reports...</p> : filteredAndSortedReports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedReports.map(report => (
                <tr key={report.id} onClick={() => handleReportClick(report.id)} className={`cursor-pointer transition-colors ${!report.isAnonymous ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'} ${newReportIds.has(report.id) ? 'flash-new' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{report.caseId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ report.isAnonymous ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800' }`}>{report.isAnonymous ? 'Anonymous User' : 'Verified User'}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{report.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.createdAt.seconds * 1000).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ report.status === 'Submitted' ? 'bg-gray-100 text-gray-800' : report.status === 'Under Review' ? 'bg-blue-100 text-blue-800' : report.status === 'Action Taken' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800' }`}>{report.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="p-6 text-gray-500">There are no reports that match the current filters.</p>}
    </div>
  );
}

export default AdminDashboard;