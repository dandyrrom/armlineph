// src/pages/admin/AdminForgotPasswordPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';

function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('If an admin account exists for this email, a password reset link has been sent. Please check your inbox.');
    } catch (firebaseError) {
      // We show a generic message to prevent email enumeration
      setMessage('If an admin account exists for this email, a password reset link has been sent. Please check your inbox.');
      console.error("Admin password reset error:", firebaseError); // Log the actual error for debugging
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-800">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mt-2">ARMLine</h1>
        <p className="text-gray-400">Administrator Portal</p>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Reset Admin Password</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your official school email to receive a password reset link.</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
        {message && <p className="text-green-700 text-sm text-center bg-green-100 p-3 rounded-md">{message}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">Official School Email</label>
                <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                required 
                />
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting || !email}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
        </form>
        
        <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/admin/login" className="font-medium text-indigo-600 hover:underline">
                Return to Sign In
            </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminForgotPasswordPage;