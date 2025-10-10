// src/pages/admin/AccountDetailsPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

function AccountDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
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
    setIsUpdating(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { status: newStatus });
      navigate('/admin/accounts'); // Navigate back to the list after updating
    } catch (err) {
      console.error("Error updating status: ", err);
      alert('Failed to update user status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <p className="p-6 text-center text-gray-500">Loading user details...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white shadow-xl rounded-2xl">
      <div className="p-6 border-b">
        <Link to="/admin/accounts" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Account Management</Link>
        <h1 className="text-xl font-bold text-gray-900">Account Approval</h1>
        <p className="mt-1 text-sm text-gray-600">Reviewing request for <span className="font-semibold">{user?.fullName}</span></p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Details Section */}
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
              <button
                onClick={() => handleUpdateStatus('approved')}
                disabled={isUpdating}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300"
              >
                {isUpdating ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleUpdateStatus('rejected')}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-red-300"
              >
                {isUpdating ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          )}
        </div>

        {/* Verification Document Section */}
        <div>
           <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Verification Document</h2>
           {user.verificationImage ? (
             <div className="mt-4 border rounded-lg p-2">
                <img src={user.verificationImage} alt="Verification Document" className="w-full h-auto rounded" />
             </div>
           ) : (
            <p className="mt-4 text-gray-500">No verification document was uploaded.</p>
           )}
        </div>
      </div>
    </div>
  );
}

export default AccountDetailsPage;