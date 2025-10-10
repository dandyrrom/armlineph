// src/pages/admin/AdminReportDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import emailjs from '@emailjs/browser'; // <-- IMPORT EMAILJS
import SimpleImageModal from '../../components/SimpleImageModal';
import SimpleVideoEmbed from '../../components/SimpleVideoEmbed';
import EscalationModal from '../../components/EscalationModal';

function AdminReportDetailsPage() {
  const { reportId } = useParams();
  const { currentUser } = useAuth();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitterName, setSubmitterName] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNames, setAdminNames] = useState({});
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const statusWorkflow = {
    'Submitted': ['Under Review'],
    'Under Review': ['Action Taken', 'Resolved'],
    'Action Taken': ['Resolved'],
    'Resolved': []
  };

  const handleEscalate = async (agency, notes) => {
    if (!currentUser || !report) return;

    const templateParams = {
      case_id: report.caseId,
      school: report.school,
      category: report.category,
      report_description: report.description,
      escalated_to_agency: agency,
      admin_notes: notes,
    };

    try {
      // 1. Send the email via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      
      alert('Escalation email sent successfully!');

      // 2. Log the action to Firestore's communication log
      const adminDocRef = doc(db, 'users', currentUser.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      const adminName = adminDocSnap.exists() ? adminDocSnap.data().fullName : currentUser.email;
      const escalationMessage = `Report escalated to ${agency} by ${adminName}. Notes: "${notes}"`;
      
      const reportDocRef = doc(db, 'reports', report.id);
      await updateDoc(reportDocRef, {
        communicationLog: arrayUnion({
          message: escalationMessage,
          authorName: 'System',
          authorRole: 'system',
          timestamp: new Date()
        })
      });

      // 3. Refetch the report to show the new log
      await fetchReport();

    } catch (err) {
      console.error("Failed to escalate:", err);
      alert("Failed to send escalation email. Check the console for details.");
    }
  };

  const getNextAllowedStatuses = () => {
    if (!report) return [];
    return statusWorkflow[report.status] || [];
  };

  const getAdminName = async (authorId, authorName) => {
    if (adminNames[authorId]) return adminNames[authorId];
    try {
      if (authorId) {
        const userDocRef = doc(db, 'users', authorId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().fullName) {
          const fullName = userDocSnap.data().fullName;
          setAdminNames(prev => ({ ...prev, [authorId]: fullName }));
          return fullName;
        }
      }
      if (authorName && authorName.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', authorName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const fullName = querySnapshot.docs[0].data().fullName;
          setAdminNames(prev => ({ ...prev, [authorName]: fullName }));
          return fullName;
        }
      }
      return authorName;
    } catch (error) {
      console.error('Error fetching admin name:', error);
      return authorName;
    }
  };

  const getImages = () => {
    if (!report) return [];
    if (report.imageUrls && report.imageUrls.length > 0) return report.imageUrls;
    if (report.imageUrl) return [report.imageUrl];
    return [];
  };

  const fetchReport = async () => {
    if (!reportId) return;
    setIsLoading(true);
    setSubmitterName(null);
    try {
      const docRef = doc(db, "reports", reportId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const reportData = { id: docSnap.id, ...docSnap.data() };
        setReport(reportData);
        setSelectedStatus(reportData.status);
        if (!reportData.isAnonymous && reportData.authorId) {
          const userDocRef = doc(db, "users", reportData.authorId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setSubmitterName(userDocSnap.data().fullName);
          }
        }
      } else {
        setError("Report not found.");
      }
    } catch (err) {
      setError("Failed to fetch report details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!reportId) return;
    setIsLoading(true);

    const docRef = doc(db, "reports", reportId);
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const reportData = { id: docSnap.id, ...docSnap.data() };
        setReport(reportData);
        setSelectedStatus(reportData.status);
        
        // Fetch submitter name if needed (this can stay as a one-time fetch)
        if (!reportData.isAnonymous && reportData.authorId) {
          const userDocRef = doc(db, "users", reportData.authorId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setSubmitterName(userDocSnap.data().fullName);
          }
        }
      } else {
        setError("Report not found.");
      }
      setIsLoading(false);
    }, (err) => {
      setError("Failed to fetch report details.");
      console.error(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [reportId]);

  const [displayLogs, setDisplayLogs] = useState([]);

  useEffect(() => {
    const updateDisplayNames = async () => {
      if (!report || !report.communicationLog) return;
      const updatedLog = await Promise.all(
        report.communicationLog.map(async (entry) => {
          if (entry.authorRole === 'admin') {
            const displayName = await getAdminName(entry.authorId, entry.authorName);
            return { ...entry, displayName };
          }
          return entry;
        })
      );
      setDisplayLogs(updatedLog);
    };
    updateDisplayNames();
  }, [report]);
  
  const openImageModal = (index) => {
    const images = getImages();
    if (images && images.length > 0 && index >= 0 && index < images.length) {
      setCurrentImageIndex(index);
      setIsModalOpen(true);
    }
  };
  
  const closeImageModal = () => setIsModalOpen(false);
  const nextImage = () => {
    const images = getImages();
    if (images.length > 0 && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  const handleUpdateStatus = async () => {
    if (!report || !selectedStatus || selectedStatus === report.status) return;
    setIsUpdating(true);
    try {
      const reportDocRef = doc(db, 'reports', report.id);
      await updateDoc(reportDocRef, { status: selectedStatus });
      await updateDoc(reportDocRef, {
        communicationLog: arrayUnion({
          message: `Status changed from "${report.status}" to "${selectedStatus}"`,
          authorName: 'System',
          authorRole: 'system',
          timestamp: new Date()
        })
      });
      await fetchReport();
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };
  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;
    setIsPosting(true);
    try {
      const adminDocRef = doc(db, 'users', currentUser.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      let adminFullName = currentUser.email;
      if (adminDocSnap.exists()) {
        adminFullName = adminDocSnap.data().fullName;
      }
      const reportDocRef = doc(db, 'reports', report.id);
      await updateDoc(reportDocRef, {
        communicationLog: arrayUnion({
          message: newMessage,
          authorName: adminFullName,
          authorId: currentUser.uid,
          authorRole: 'admin',
          timestamp: new Date()
        })
      });
      setNewMessage('');
      fetchReport();
    } catch (error) {
      console.error("Error posting message: ", error);
      alert("Failed to post message.");
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) return <div className="flex-grow flex items-center justify-center"><div className="text-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading report details...</p></div></div>;
  if (error) return <div className="flex-grow flex items-center justify-center"><div className="text-center p-8 text-red-600 bg-red-50 rounded-lg max-w-md"><p className="text-lg font-medium">{error}</p><Link to="/admin/reports" className="inline-block mt-4 text-blue-600 hover:text-blue-800">&larr; Back to Reports</Link></div></div>;

  const allowedStatuses = getNextAllowedStatuses();
  const images = getImages();

  return (
    <div className="flex-grow bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin/reports" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Reports Dashboard
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h1 className="text-2xl font-bold">Report Details</h1>
                <p className="font-mono text-blue-100 mt-1 text-lg">{report.caseId}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="text-sm font-medium text-gray-500">Status</label><div className="mt-1"><span className={`px-3 py-1 text-xs font-medium uppercase rounded-full ${report.status === 'Submitted' ? 'bg-gray-100 text-gray-800' : report.status === 'Under Review' ? 'bg-blue-100 text-blue-800' : report.status === 'Action Taken' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{report.status}</span></div></div>
                  <div><label className="text-sm font-medium text-gray-500">Date Submitted</label><p className="text-gray-900 font-medium">{new Date(report.createdAt.seconds * 1000).toLocaleString()}</p></div>
                  <div><label className="text-sm font-medium text-gray-500">School</label><p className="text-gray-900 font-medium">{report.school}</p></div>
                  <div><label className="text-sm font-medium text-gray-500">Category</label><p className="text-gray-900 font-medium">{report.category}</p></div>
                  <div className="md:col-span-2"><label className="text-sm font-medium text-gray-500">Submitted By</label><div className="mt-1">{report.isAnonymous ? <span className="px-3 py-1 text-xs font-medium uppercase rounded-full bg-purple-100 text-purple-800">Anonymous User</span> : <div className="flex items-center space-x-2"><span className="px-2 py-1 text-xs font-medium uppercase rounded-full bg-green-100 text-green-800">Verified User</span>{submitterName ? <span className="text-gray-900 font-medium">{submitterName}</span> : <span className="text-gray-500 text-sm">Loading name...</span>}</div>}</div></div>
                  
                  {/* --- NEW FIELDS START HERE --- */}
                  <div className="md:col-span-2 pt-4 border-t"><h3 className="text-md font-semibold text-gray-800 mb-2">Incident Details</h3></div>
                  <div><label className="text-sm font-medium text-gray-500">Date of Incident</label><p className="text-gray-900 font-medium">{report.incidentDate}</p></div>
                  <div><label className="text-sm font-medium text-gray-500">Time of Incident</label><p className="text-gray-900 font-medium">{report.incidentTime || 'N/A'}</p></div>
                  <div className="md:col-span-2"><label className="text-sm font-medium text-gray-500">Location</label><p className="text-gray-900 font-medium">{report.location}</p></div>
                  {/* --- NEW FIELDS END HERE --- */}
                  
                  <div className="md:col-span-2"><label className="text-sm font-medium text-gray-500">Description of Incident</label><div className="mt-1 bg-gray-50 rounded-lg p-4"><p className="text-gray-700 whitespace-pre-wrap">{report.description}</p></div></div>

                  {/* --- MORE NEW FIELDS (conditionally rendered) --- */}
                  {report.partiesInvolved && <div className="md:col-span-2"><label className="text-sm font-medium text-gray-500">Parties Involved</label><div className="mt-1 bg-gray-50 rounded-lg p-4"><p className="text-gray-700 whitespace-pre-wrap">{report.partiesInvolved}</p></div></div>}
                  {report.witnesses && <div className="md:col-span-2"><label className="text-sm font-medium text-gray-500">Witnesses</label><div className="mt-1 bg-gray-50 rounded-lg p-4"><p className="text-gray-700 whitespace-pre-wrap">{report.witnesses}</p></div></div>}
                  {report.desiredOutcome && <div className="md:col-span-2"><label className="text-sm font-medium text-gray-500">Desired Outcome</label><div className="mt-1 bg-gray-50 rounded-lg p-4"><p className="text-gray-700 whitespace-pre-wrap">{report.desiredOutcome}</p></div></div>}
                </div>
                {(images.length > 0 || report.videoUrl) && <div className="mt-8 pt-8 border-t"><h2 className="text-lg font-semibold text-gray-900 mb-6">Evidence</h2>{images.length > 0 && <div className="mb-8"><div className="flex items-center justify-between mb-4"><h3 className="text-md font-medium text-gray-700">Images ({images.length})</h3>{images.length > 1 && <button onClick={() => openImageModal(0)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>}</div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{images.map((imageUrl, index) => <div key={index} className="group cursor-pointer transform hover:scale-105 transition-transform duration-200" onClick={() => openImageModal(index)}><div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors"><img src={imageUrl} alt={`Evidence image ${index + 1}`} className="w-full h-full object-cover" /></div><div className="text-xs text-gray-500 text-center mt-1">Image {index + 1}</div></div>)}</div></div>}{report.videoUrl && <div><h3 className="text-md font-medium text-gray-700 mb-4">Video Evidence</h3><SimpleVideoEmbed videoUrl={report.videoUrl} /></div>}</div>}
              </div>
            </div>
            <div className="bg-white shadow-xl rounded-2xl p-6"><h2 className="text-xl font-bold text-gray-900 border-b pb-4">Communication Log</h2><div className="mt-6 space-y-4 max-h-96 overflow-y-auto">{displayLogs && displayLogs.length > 0 ? displayLogs.map((entry, index) => <div key={index} className={`p-4 rounded-lg ${entry.authorRole === 'admin' ? 'bg-blue-50' : entry.authorRole === 'system' ? 'bg-gray-100' : 'bg-gray-50'}`}><p className="text-sm font-semibold text-gray-800">{entry.displayName || entry.authorName} <span className="text-xs font-normal text-gray-500"> ({entry.authorRole})</span></p><p className="mt-1 text-gray-700">{entry.message}</p><p className="text-right text-xs text-gray-400 mt-2">{new Date(entry.timestamp.seconds * 1000).toLocaleString()}</p></div>) : <p className="text-sm text-gray-500 text-center py-8">No messages have been posted yet.</p>}</div><form onSubmit={handlePostMessage} className="mt-6 border-t pt-6"><label htmlFor="newMessage" className="text-sm font-bold text-gray-600 block mb-2">Post an Update or Message</label><textarea id="newMessage" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows="4" className="w-full p-3 border border-gray-300 rounded-md" placeholder="Type your message here..." required></textarea><button type="submit" disabled={isPosting} className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">{isPosting ? 'Posting...' : 'Post Message'}</button></form></div>
          </div>
          <div className="space-y-8">
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Report Actions</h2>
              <div className="mt-6 space-y-6">
                <div><label htmlFor="statusSelect" className="text-sm font-bold text-gray-600 block mb-2">Update Status</label><select id="statusSelect" onChange={(e) => setSelectedStatus(e.target.value)} className="w-full p-3 border border-gray-300 rounded text-sm mb-3" value={selectedStatus}><option value={report.status}>Current: {report.status}</option>{allowedStatuses.map(status => <option key={status} value={status}>Change to: {status}</option>)}</select><button onClick={handleUpdateStatus} disabled={isUpdating || selectedStatus === report.status} className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">{isUpdating ? 'Updating...' : 'Update Status'}</button><div className="mt-3 p-3 bg-gray-50 rounded-lg"><p className="text-xs font-medium text-gray-600">Workflow:</p><p className="text-xs text-gray-700 mt-1">{report.status} {allowedStatuses.length > 0 && ` → ${allowedStatuses.join(' → ')}`}{allowedStatuses.length === 0 && ' (Final status)'}</p></div></div>
                <div className="border-t pt-6">
                  <label className="text-sm font-bold text-gray-600 block mb-2">External Escalation</label>
                  <button onClick={() => setIsEscalationModalOpen(true)} className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm">Escalate to Authorities</button>
                  <p className="text-xs text-gray-500 mt-2">For critical cases requiring external intervention.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {images.length > 0 && isModalOpen && <SimpleImageModal isOpen={isModalOpen} images={images} currentIndex={currentImageIndex} onClose={closeImageModal} onNext={nextImage} onPrev={prevImage} />}
      <EscalationModal 
        isOpen={isEscalationModalOpen} 
        onClose={() => setIsEscalationModalOpen(false)}
        onEscalate={handleEscalate}
        report={report}
      />
    </div>
  );
}

export default AdminReportDetailsPage;