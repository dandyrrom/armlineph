// src/pages/CheckStatusPage.jsx

import { useState } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../services/firebase';
import SimpleImageModal from '../components/SimpleImageModal'; // Import
import SimpleVideoEmbed from '../components/SimpleVideoEmbed'; // Import

function CheckStatusPage() {
  // State for the form and results
  const [caseIdInput, setCaseIdInput] = useState('');
  const [foundReport, setFoundReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for image modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFoundReport(null);

    try {
      const reportsRef = collection(db, "reports");
      const q = query(reportsRef, where("caseId", "==", caseIdInput.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No report found with that Case ID. Please check the ID and try again.');
      } else {
        const reportData = querySnapshot.docs[0].data();
        setFoundReport(reportData);
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for evidence display
  const getImages = () => {
    if (!foundReport) return [];
    if (foundReport.imageUrls && foundReport.imageUrls.length > 0) return foundReport.imageUrls;
    if (foundReport.imageUrl) return [foundReport.imageUrl];
    return [];
  };

  const images = getImages();

  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };
  const closeImageModal = () => setIsModalOpen(false);
  const nextImage = () => {
    if (images.length > 0 && currentImageIndex < images.length - 1) setCurrentImageIndex(currentImageIndex + 1);
  };
  const prevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1);
  };

  return (
    <div className="flex-grow flex flex-col items-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl mt-8 space-y-8">
        {/* The search form */}
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">Track Your Report</h2>
          <p className="text-center text-gray-500 mt-2">Enter the Case ID you received upon submission.</p>
          <form onSubmit={handleCheckStatus} className="mt-6 flex gap-2">
            <input
              type="text"
              value={caseIdInput}
              onChange={(e) => setCaseIdInput(e.target.value)}
              className="flex-grow w-full p-3 border border-gray-300 rounded-md shadow-sm"
              placeholder="e.g., ARMLN-25-ABC123"
              required
            />
            <button type="submit" disabled={isLoading} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm disabled:bg-gray-400">
              {isLoading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {error && <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

        {foundReport && (
          <>
            {/* Report Details Card */}
            <div className="bg-white shadow-xl rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900">Report Details for <span className="text-blue-600 font-mono">{foundReport.caseId}</span></h3>
              <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div><dt className="font-medium text-gray-500">School</dt><dd className="mt-1 text-gray-900">{foundReport.school}</dd></div>
                <div><dt className="font-medium text-gray-500">Category</dt><dd className="mt-1 text-gray-900">{foundReport.category}</dd></div>
                <div><dt className="font-medium text-gray-500">Date Submitted</dt><dd className="mt-1 text-gray-900">{foundReport.createdAt ? new Date(foundReport.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</dd></div>
                <div><dt className="font-medium text-gray-500">Status</dt><dd className="mt-1"><span className="px-2 py-1 text-xs font-medium uppercase rounded-full bg-yellow-100 text-yellow-800">{foundReport.status}</span></dd></div>
                <div className="md:col-span-2"><dt className="font-medium text-gray-500">Description</dt><dd className="mt-1 text-gray-900 whitespace-pre-wrap">{foundReport.description}</dd></div>
              </div>

              {(images.length > 0 || foundReport.videoUrl) && (
                <div className="mt-8 pt-8 border-t">
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
                  {foundReport.videoUrl && (
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-4">Video Evidence</h3>
                      <SimpleVideoEmbed videoUrl={foundReport.videoUrl} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Communication Log (Read-Only) */}
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Communication Log</h2>
              <div className="mt-6 space-y-4 max-h-96 overflow-y-auto p-2">
                {foundReport.communicationLog && foundReport.communicationLog.length > 0 ? (
                  foundReport.communicationLog.map((entry, index) => (
                    <div key={index} className={`p-4 rounded-lg ${
                      entry.authorRole === 'admin' ? 'bg-blue-50' : 
                      entry.authorRole === 'system' ? 'bg-gray-100' : 
                      'bg-green-50' // User's original messages
                    }`}>
                      <p className="text-sm font-semibold text-gray-800">
                        {entry.authorRole.charAt(0).toUpperCase() + entry.authorRole.slice(1)}
                      </p>
                      <p className="mt-1 text-gray-700">{entry.message}</p>
                      <p className="text-right text-xs text-gray-400 mt-2">
                        {new Date(entry.timestamp.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No messages have been posted for this report yet.</p>
                )}
              </div>
            </div>
          </>
        )}
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

export default CheckStatusPage;