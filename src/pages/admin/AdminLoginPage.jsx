// src/pages/admin/AdminLoginPage.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role === 'admin' || userData.role === 'superAdmin') {
          if (userData.status === 'approved') {
            if (userData.role === 'superAdmin') {
              navigate('/admin/accounts'); 
            } else {
              navigate('/admin/reports');
            }
          } else if (userData.status === 'rejected') {
            setError('Your admin account request has been rejected.');
            await signOut(auth);
          } else {
            setError('Your admin account is still pending approval.');
            await signOut(auth);
          }
        } else {
          setError('Access denied. This portal is for administrators only.');
          await signOut(auth);
        }
      } else {
        setError('User data not found. Access denied.');
        await signOut(auth);
      }
    } catch (firebaseError) {
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-800">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mt-2">ARMLine</h1>
        <p className="text-gray-400">Administrator Portal</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">Admin Sign In</h2>
        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">Official School Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <input 
                type={isPasswordVisible ? 'text' : 'password'} 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                required 
              />
              {password && (
                <button 
                  type="button" 
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-gray-600"
                >
                  {isPasswordVisible ? 'HIDE' : 'SHOW'}
                </button>
              )}
            </div>
            <div className="text-right mt-2">
              <Link to="/admin/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline">Forgot Password</Link>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={!email || !password}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Need an admin account?{' '}
          <Link to="/admin/register" className="font-medium text-indigo-600 hover:underline">
            Request Access
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLoginPage;