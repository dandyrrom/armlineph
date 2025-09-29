// src/pages/ReportDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import SimpleImageModal from '../components/SimpleImageModal';
import SimpleVideoEmbed from '../components/SimpleVideoEmbed';

function ReportDetailsPage() {
  const { reportId } = useParams();
  const { currentUser } = useAuth(); // Get current user
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for image modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State for new messages
  const [newMessage, setNewMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fetchReport = async () => {
    try {
      const docRef = doc(db, "reports", reportId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Report not found.");
      }
    } catch (err) {
      setError("Failed to fetch report details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  // Function to open image modal
  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  // Function to close image modal
  const closeImageModal = () => {
    setIsModalOpen(false);
  };

  // Get images array (support both old single image and new multiple images)
  const getImages = () => {
    if (!report) return [];
    
    if (report.imageUrls && report.imageUrls.length > 0) {
      return report.imageUrls;
    }
    
    if (report.imageUrl) {
      return [report.imageUrl];
    }
    
    return [];
  };
  
  const images = getImages();

  // Function to navigate to next image - UPDATED to use getImages()
  const nextImage = () => {
    if (images.length > 0 && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  // Function to navigate to previous image
  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Function to post a new message
  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    setIsPosting(true);
    try {
      const reportDocRef = doc(db, 'reports', report.id);
      await updateDoc(reportDocRef, {
        communicationLog: arrayUnion({
          message: newMessage,
          authorName: currentUser.displayName || 'User',
          authorId: currentUser.uid,
          authorRole: 'user',
          timestamp: new Date()
        })
      });

      setNewMessage('');
      fetchReport(); // Refetch to show the new message
    } catch (error) {
      console.error("Error posting message: ", error);
      alert("Failed to post message.");
    } finally {
      setIsPosting(false);
    }
  };


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

  if (error) {
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

  return (
    <div className="flex-grow bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Report Details Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-2xl font-bold">Report Details</h1>
            <p className="font-mono text-blue-100 mt-1 text-lg">{report.caseId}</p>
            <div className="flex items-center mt-4">
              <span className={`px-3 py-1 text-xs font-medium uppercase rounded-full ${
                report.status === 'Submitted' ? 'bg-blue-500' :
                report.status === 'Under Review' ? 'bg-yellow-500' :
                report.status === 'Action Taken' ? 'bg-orange-500' :
                'bg-green-500'
              }`}>
                {report.status}
              </span>
              <span className="ml-4 text-blue-100">
                {new Date(report.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">School</label>
                    <p className="text-gray-900 font-medium">{report.school}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-900 font-medium">{report.category}</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.description}</p>
                </div>
              </div>
            </div>

            {(images.length > 0 || report.videoUrl) && (
              <div className="pt-8 border-t">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Evidence</h2>
                {images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-md font-medium text-gray-700 mb-4">Images ({images.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
          <div className="mt-6 space-y-4 max-h-96 overflow-y-auto p-2">
            {report.communicationLog && report.communicationLog.length > 0 ? (
              report.communicationLog.map((entry, index) => (
                <div key={index} className={`flex flex-col ${
                  entry.authorId === currentUser.uid ? 'items-end' : 'items-start'
                }`}>
                  <div className={`p-4 rounded-lg max-w-lg ${
                    entry.authorId === currentUser.uid ? 'bg-blue-500 text-white' :
                    entry.authorRole === 'admin' ? 'bg-gray-200 text-gray-800' :
                    'bg-yellow-100 text-yellow-900' // System messages
                  }`}>
                    <p className="text-sm font-semibold">
                      {entry.authorId === currentUser.uid ? 'You' : (entry.authorRole === 'admin' ? 'Admin' : 'System')}
                    </p>
                    <p className="mt-1">{entry.message}</p>
                    <p className={`text-right text-xs mt-2 ${
                      entry.authorId === currentUser.uid ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(entry.timestamp.seconds * 1000).toLocaleString()}
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
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
              placeholder="Type your message here..."
              required
            ></textarea>
            <button
              type="submit"
              disabled={isPosting}
              className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
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

export default ReportDetailsPage;