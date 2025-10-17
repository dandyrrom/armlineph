// src/pages/admin/AccountDetailsPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import SimpleImageModal from '../../components/SimpleImageModal'; // --- IMPORT THE MODAL ---

function AccountDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // --- NEW STATE FOR THE IMAGE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // --- END NEW STATE ---

  useEffect(() => {
    const fetchUser = async () => {
      // ... (fetchUser logic remains the same)
      if (!userId) return;
      setIsLoading(true);
      try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('User not found.');
        }
      } catch (err) {
        setError('Failed to fetch user details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleUpdateStatus = async (newStatus) => {
    // ... (handleUpdateStatus logic remains the same)
    setIsUpdating(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { status: newStatus });
      navigate('/admin/accounts');
    } catch (err) {
      console.error("Error updating status: ", err);
      alert('Failed to update user status.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // --- NEW HANDLER TO OPEN THE MODAL ---
  const openImageModal = (images, index) => {
    setModalImages(images);
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };
  
  const closeImageModal = () => setIsModalOpen(false);
  const nextImage = () => { if (currentImageIndex < modalImages.length - 1) setCurrentImageIndex(currentImageIndex + 1); };
  const prevImage = () => { if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1); };
  // --- END NEW HANDLER ---


  if (isLoading) return <p className="p-6 text-center text-gray-500">Loading user details...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  // --- HELPER TO GET ALL PARENT DOCS FOR MODAL ---
  const parentDocs = [
    { title: "Parent/Guardian's Personal ID", url: user.personalIdImage },
    { title: "Student's School ID", url: user.studentIdImage },
    { title: "Proof of Relationship", url: user.guardianshipProofImage },
  ].filter(doc => doc.url); // Filter out any missing docs

  return (
    <> {/* Use Fragment to wrap page and modal */}
      <div className="bg-white shadow-xl rounded-2xl">
        <div className="p-6 border-b">
          <Link to="/admin/accounts" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Account Management</Link>
          <h1 className="text-xl font-bold text-gray-900">Account Approval</h1>
          <p className="mt-1 text-sm text-gray-600">Reviewing request for <span className="font-semibold">{user?.fullName}</span></p>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Details Section (unchanged) */}
          <div className="space-y-4">
              <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">User Information</h2>
              <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-gray-900">{user.fullName}</dd>
              </div>
              <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-gray-900">{user.email}</dd>
              </div>
              <div>
                  <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                  <dd className="mt-1 text-gray-900 capitalize">{user.role || user.userType}</dd>
              </div>
              {user.userType === 'Parent or Legal Guardian' && user.relatedStudentName && (
                  <div>
                  <dt className="text-sm font-medium text-gray-500">Related Student</dt>
                  <dd className="mt-1 text-gray-900">{user.relatedStudentName}</dd>
                  </div>
              )}
              <div>
                  <dt className="text-sm font-medium text-gray-500">School</dt>
                  <dd className="mt-1 text-gray-900">{user.school}</dd>
              </div>
              <div>
                  <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                  <dd className="mt-1 text-gray-900 capitalize font-medium">{user.status}</dd>
              </div>
              {user.status === 'pending' && (
                  <div className="flex items-center gap-4 pt-4 border-t">
                  <button onClick={() => handleUpdateStatus('approved')} disabled={isUpdating} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300">
                      {isUpdating ? 'Approving...' : 'Approve'}
                  </button>
                  <button onClick={() => handleUpdateStatus('rejected')} disabled={isUpdating} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-red-300">
                      {isUpdating ? 'Rejecting...' : 'Reject'}
                  </button>
                  </div>
              )}
          </div>

          {/* --- NEW, REFACTORED DOCUMENT UI --- */}
          <div className="space-y-6">
            <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Verification Documents</h2>
            
            {/* Case for Students */}
            {user.userType === 'Student' && user.verificationImage && (
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Student Verification Document</h3>
                <div 
                  className="group cursor-pointer"
                  onClick={() => openImageModal([user.verificationImage], 0)}
                >
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors">
                    <img src={user.verificationImage} alt="Verification Document Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-1">Click to enlarge</p>
                </div>
              </div>
            )}

            {/* Case for Parents/Guardians */}
            {user.userType === 'Parent or Legal Guardian' && parentDocs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {parentDocs.map((doc, index) => (
                        <div 
                          key={index} 
                          className="group cursor-pointer"
                          onClick={() => openImageModal(parentDocs.map(d => d.url), index)}
                        >
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors">
                                <img src={doc.url} alt={`${doc.title} thumbnail`} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs font-semibold text-gray-700 mt-2 truncate">{doc.title}</p>
                            <p className="text-xs text-gray-500">Click to enlarge</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Fallback if no documents are found */}
            {!user.verificationImage && parentDocs.length === 0 && (
              <p className="mt-4 text-gray-500 bg-gray-100 p-4 rounded-lg">No verification documents were found for this user.</p>
            )}
          </div>
        </div>
      </div>

      {/* --- RENDER THE MODAL --- */}
      <SimpleImageModal 
        isOpen={isModalOpen}
        images={modalImages}
        currentIndex={currentImageIndex}
        onClose={closeImageModal}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </>
  );
}

export default AccountDetailsPage;