import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // 👈 IMPORT HOOKS
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../services/firebase';
import SimpleImageModal from '../components/SimpleImageModal';
import SimpleVideoEmbed from '../components/SimpleVideoEmbed';

function CheckStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize state from URL or empty string
  const [caseIdInput, setCaseIdInput] = useState(searchParams.get('caseId') || '');
  const [foundReport, setFoundReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to fetch report data, reusable for both search and refresh
  const fetchReportByCaseId = async (caseId) => {
    if (!caseId) return;
    setIsLoading(true);
    setError('');
    setFoundReport(null);

    try {
      const reportsRef = collection(db, "reports");
      const q = query(reportsRef, where("caseId", "==", caseId.trim()));
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

  // Effect to fetch data if caseId is in the URL on initial load
  useEffect(() => {
    const caseIdFromUrl = searchParams.get('caseId');
    if (caseIdFromUrl) {
      fetchReportByCaseId(caseIdFromUrl);
    }
  }, []); // Runs only once on component mount

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Update the URL, which will trigger a re-render and can be bookmarked
    navigate(`/check-status?caseId=${caseIdInput.trim()}`);
    fetchReportByCaseId(caseIdInput);
  };

  // Handler for the manual refresh button
  const handleManualRefresh = () => {
    fetchReportByCaseId(caseIdInput);
  };
  
  // Helper functions for evidence (unchanged)
  const getImages = () => {
    if (!foundReport) return [];
    if (foundReport.imageUrls && foundReport.imageUrls.length > 0) return foundReport.imageUrls;
    if (foundReport.imageUrl) return [foundReport.imageUrl];
    return [];
  };

  const images = getImages();
  const openImageModal = (index) => { setIsModalOpen(true); setCurrentImageIndex(index); };
  const closeImageModal = () => setIsModalOpen(false);
  const nextImage = () => { if (images.length > 0 && currentImageIndex < images.length - 1) setCurrentImageIndex(currentImageIndex + 1); };
  const prevImage = () => { if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1); };

  const statusStyles = {
    'Submitted': 'bg-gray-100 text-gray-800',
    'Under Review': 'bg-yellow-100 text-yellow-800',
    'Action Taken': 'bg-orange-100 text-orange-800',
    'Resolved': 'bg-green-100 text-green-800',
  };
  const currentStatusStyle = foundReport ? statusStyles[foundReport.status] || 'bg-gray-100 text-gray-800' : '';


  return (
    <div className="flex-grow flex flex-col items-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl mt-8 space-y-8">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">Track Your Report</h2>
          <p className="text-center text-gray-500 mt-2">Enter the Case ID you received upon submission.</p>
          <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
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
            <div className="bg-white shadow-xl rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Report Details for <span className="text-blue-600 font-mono">{foundReport.caseId}</span></h3>
                {/* 👇 ADDED REFRESH BUTTON */}
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 disabled:bg-gray-200"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                <div>
                <dt className="font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                        <span className={`px-2 py-1 text-xs font-medium uppercase rounded-full ${currentStatusStyle}`}>
                        {foundReport.status}
                        </span>
                    </dd>
                </div>
                <div><dt className="font-medium text-gray-500">Date Submitted</dt><dd className="mt-1 text-gray-900">{foundReport.createdAt ? new Date(foundReport.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</dd></div>
                
                <div><dt className="font-medium text-gray-500">School</dt><dd className="mt-1 text-gray-900">{foundReport.school}</dd></div>
                <div><dt className="font-medium text-gray-500">Category</dt><dd className="mt-1 text-gray-900">{foundReport.category}</dd></div>
                
                <div><dt className="font-medium text-gray-500">Date of Incident</dt><dd className="mt-1 text-gray-900">{foundReport.incidentDate}</dd></div>
                <div><dt className="font-medium text-gray-500">Time of Incident</dt><dd className="mt-1 text-gray-900">{foundReport.incidentTime || 'N/A'}</dd></div>
                
                <div className="md:col-span-2"><dt className="font-medium text-gray-500">Location</dt><dd className="mt-1 text-gray-900">{foundReport.location}</dd></div>
                <div className="md:col-span-2"><dt className="font-medium text-gray-500">Description</dt><dd className="mt-1 text-gray-900 whitespace-pre-wrap">{foundReport.description}</dd></div>

                {foundReport.partiesInvolved && <div className="md:col-span-2"><dt className="font-medium text-gray-500">Parties Involved</dt><dd className="mt-1 text-gray-700 whitespace-pre-wrap">{foundReport.partiesInvolved}</dd></div>}
                {foundReport.witnesses && <div className="md:col-span-2"><dt className="font-medium text-gray-500">Witnesses</dt><dd className="mt-1 text-gray-700 whitespace-pre-wrap">{foundReport.witnesses}</dd></div>}
                {foundReport.desiredOutcome && <div className="md:col-span-2"><dt className="font-medium text-gray-500">Desired Outcome</dt><dd className="mt-1 text-gray-700 whitespace-pre-wrap">{foundReport.desiredOutcome}</dd></div>}
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