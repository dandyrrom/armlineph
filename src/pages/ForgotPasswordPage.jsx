// src/pages/ForgotPasswordPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect runs only when a message appears, then scrolls to the top.
  useEffect(() => {
    if (message || error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [message, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('If an account exists for this email, a password reset link has been sent. Please check your inbox.');
    } catch (firebaseError) {
      // We show a generic message to prevent email enumeration
      setMessage('If an account exists for this email, a password reset link has been sent. Please check your inbox.');
      console.error("Password reset error:", firebaseError); // Log the actual error for debugging
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your email to receive a password reset link.</p>
          </div>

          <div>
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
            {message && <p className="text-green-700 text-sm text-center bg-green-100 p-3 rounded-md">{message}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="text-sm font-bold text-gray-600 block">Email Address</label>
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded mt-1" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !email}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          <div className="text-center text-sm text-gray-600">
            <p>Remember your password? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Log In</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;