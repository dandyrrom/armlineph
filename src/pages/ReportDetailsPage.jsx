// src/pages/ReportDetailsPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
// --- FIXED IMPORT PATHS ---
import { db } from '/src/services/firebase.js';
import { useAuth } from '/src/context/AuthContext.jsx';
import SimpleImageModal from '/src/components/SimpleImageModal.jsx';
import SimpleVideoEmbed from '/src/components/SimpleVideoEmbed.jsx';
// --- END FIXED IMPORT PATHS ---

function ReportDetailsPage() {
  const { reportId } = useParams();
  const { currentUser } = useAuth();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const logContainerRef = useRef(null); // Ref for the communication log container

  // Auto-scroll Effect with Smooth Behavior
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth' // Added smooth scrolling
      });
    }
  }, [report?.communicationLog]); // Runs when communicationLog updates

  // Fetch report data listener
  useEffect(() => {
    if (!reportId) {
        setError("Invalid Report ID specified.");
        setIsLoading(false);
        return;
    };

    const docRef = doc(db, "reports", reportId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const reportData = { id: docSnap.id, ...docSnap.data() };
        // Basic validation: Check if the current user is the submitter (if not anonymous)
        if (currentUser && !reportData.isAnonymous && reportData.submittedById !== currentUser.uid) {
             setError("You do not have permission to view this report.");
             setReport(null);
        } else {
             setReport(reportData);
             setError(''); // Clear error on successful fetch
        }
      } else {
        setError("Report not found.");
        setReport(null);
      }
      setIsLoading(false);
    }, (err) => {
      setError("Failed to fetch report details. Check your connection.");
      console.error(err);
      setIsLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [reportId, currentUser]); // Added currentUser dependency

  // Image Modal Handlers (unchanged)
  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };
  const closeImageModal = () => {
    setIsModalOpen(false);
  };
  const getImages = () => {
    if (!report) return [];
    if (report.imageUrls && report.imageUrls.length > 0) return report.imageUrls;
    if (report.imageUrl) return [report.imageUrl];
    return [];
  };
  const images = getImages();
  const nextImage = () => {
    if (images.length > 0 && currentImageIndex < images.length - 1) setCurrentImageIndex(currentImageIndex + 1);
  };
  const prevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1);
  };

  // Handle posting a new message (unchanged)
  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser || !report) return;

    // Prevent posting if the user doesn't own the report (security check)
    if (!report.isAnonymous && report.submittedById !== currentUser.uid) {
        setError("You cannot post messages to this report.");
        return;
    }


    setIsPosting(true);
    setError(''); // Clear previous errors
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      if (!userData) throw new Error("Could not retrieve user data.");

      const reportDocRef = doc(db, 'reports', report.id);
      await updateDoc(reportDocRef, {
        communicationLog: arrayUnion({
          message: newMessage,
          authorName: userData.fullName,
          authorId: currentUser.uid,
          authorRole: 'user',
          authorType: userData.userType,
          timestamp: new Date()
        })
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error posting message: ", error);
      setError("Failed to post message. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // --- Rendering Logic ---
  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  // If there's an error AND no report data could be loaded, show error page
  if (error && !report) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg max-w-md">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium">{error}</p>
          <Link to="/dashboard" className="inline-block mt-4 text-blue-600 hover:text-blue-800">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If report data is loaded, render the details page
  if (report) {
      return (
        <div className="flex-grow bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>

            {/* Display post error message if any */}
            {error && <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h1 className="text-2xl font-bold">Report Details</h1>
                <p className="font-mono text-blue-100 mt-1 text-lg">{report.caseId}</p>
                <div className="flex flex-wrap items-center mt-4 gap-4"> {/* Added flex-wrap and gap */}
                  <span className={`px-3 py-1 text-xs font-medium uppercase rounded-full ${
                    report.status === 'Submitted' ? 'bg-blue-500' :
                    report.status === 'Under Review' ? 'bg-yellow-500' :
                    report.status === 'Action Taken' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}>
                    {report.status}
                  </span>
                  {report.isAnonymous && (
                    <span className="px-3 py-1 text-xs font-medium uppercase rounded-full bg-blue-200 text-blue-800">
                      Submitted Anonymously
                    </span>
                  )}
                  <span className="text-blue-100 text-sm"> {/* Adjusted text size */}
                    {new Date(report.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Incident Information Section */}
              <div className="p-6 space-y-8">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm"> {/* Adjusted text size */}
                      {/* ... Details remain the same ... */}
                      <div><label className="font-medium text-gray-500">School</label><p className="text-gray-900 mt-1">{report.school}</p></div>
                      <div><label className="font-medium text-gray-500">Category</label><p className="text-gray-900 mt-1">{report.category}</p></div>
                      <div><label className="font-medium text-gray-500">Date of Incident</label><p className="text-gray-900 mt-1">{report.incidentDate}</p></div>
                      <div><label className="font-medium text-gray-500">Time of Incident</label><p className="text-gray-900 mt-1">{report.incidentTime || 'N/A'}</p></div>
                      <div className="md:col-span-2"><label className="font-medium text-gray-500">Location</label><p className="text-gray-900 mt-1">{report.location}</p></div>
                      <div className="md:col-span-2"><label className="font-medium text-gray-500">Description</label><div className="mt-1 bg-gray-50 rounded-lg p-3 border"><p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.description}</p></div></div>
                      {report.partiesInvolved && <div className="md:col-span-2"><label className="font-medium text-gray-500">Parties Involved</label><p className="text-gray-700 mt-1 whitespace-pre-wrap">{report.partiesInvolved}</p></div>}
                      {report.witnesses && <div className="md:col-span-2"><label className="font-medium text-gray-500">Witnesses</label><p className="text-gray-700 mt-1 whitespace-pre-wrap">{report.witnesses}</p></div>}
                      {report.desiredOutcome && <div className="md:col-span-2"><label className="font-medium text-gray-500">Desired Outcome</label><p className="text-gray-700 mt-1 whitespace-pre-wrap">{report.desiredOutcome}</p></div>}
                    </div>
                </div>

                {/* Evidence Section */}
                {(images.length > 0 || report.videoUrl) && (
                  <div className="pt-8 border-t">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Evidence</h2>
                    {images.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-md font-medium text-gray-700 mb-4">Images ({images.length})</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"> {/* Adjusted grid columns */}
                          {images.map((imageUrl, index) => (
                            <div key={index} className="group cursor-pointer" onClick={() => openImageModal(index)}>
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors">
                                <img src={imageUrl} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {report.videoUrl && (
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-4">Video Evidence</h3>
                        <SimpleVideoEmbed videoUrl={report.videoUrl} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Communication Log Section */}
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Communication Log</h2>
              {/* Apply the ref to the scrollable div */}
              <div ref={logContainerRef} className="mt-6 space-y-4 max-h-96 overflow-y-auto p-2 border rounded-md bg-gray-50">
                {report.communicationLog && report.communicationLog.length > 0 ? (
                  report.communicationLog.map((entry, index) => (
                    <div key={index} className={`flex flex-col ${
                      // Align user messages to the right, others to the left
                      entry.authorId === currentUser?.uid ? 'items-end' : 'items-start'
                    }`}>
                          <div className={`p-3 rounded-lg max-w-xl shadow-sm ${ // Adjusted padding and max-width
                            entry.authorId === currentUser?.uid ? 'bg-blue-600 text-white' : // User messages
                            entry.authorRole === 'admin' || entry.authorRole === 'superAdmin' ? 'bg-gray-200 text-gray-800' : // Admin messages
                            'bg-yellow-100 text-yellow-900' // System messages
                          }`}>
                            <p className="text-xs font-semibold mb-1 opacity-80"> {/* Adjusted text size and margin */}
                              {entry.authorId === currentUser?.uid
                                ? 'You'
                                : entry.authorRole === 'user'
                                  ? `${entry.authorName} (${entry.authorType})`
                                  : entry.authorType === 'superAdmin'
                                    ? `${entry.authorName} - Head Admin`
                                    : entry.authorRole === 'admin' && entry.department
                                      ? `${entry.authorName} - ${entry.department} Admin`
                                      : (entry.authorName || entry.authorRole?.charAt(0).toUpperCase() + entry.authorRole?.slice(1)) || 'System'
                              }
                            </p>
                            <p className="text-sm">{entry.message}</p> {/* Adjusted text size */}
                            <p className={`text-right text-xs mt-2 opacity-70 ${ // Adjusted opacity
                              entry.authorId === currentUser?.uid ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(entry.timestamp?.seconds * 1000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">No messages have been posted yet. Start the conversation!</p>
                    )}
                  </div>
                  <form onSubmit={handlePostMessage} className="mt-6 border-t pt-6">
                    <label htmlFor="newMessage" className="text-sm font-bold text-gray-600 block mb-2">
                      Post a Reply
                    </label>
                    <textarea
                      id="newMessage"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type your message here..."
                      required
                      disabled={!currentUser || isPosting} // Disable if not logged in or posting
                    ></textarea>
                    <button
                      type="submit"
                      disabled={isPosting || !currentUser || newMessage.trim() === ''} // Add disabled conditions
                      className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPosting ? 'Posting...' : 'Post Message'}
                    </button>
                  </form>
                </div>
              </div>

              <SimpleImageModal
                isOpen={isModalOpen}
                images={images}
                currentIndex={currentImageIndex}
                onClose={closeImageModal}
                onNext={nextImage}
                onPrev={prevImage}
              />
            </div>
        );
    }

  // Fallback if report is null after loading and no error (should ideally not be reached)
  return <div className="flex-grow p-4 text-center text-gray-500">Could not display report details.</div>;
}

export default ReportDetailsPage;