// src/pages/LoginPage.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../services/firebase';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // This effect runs only when an error message appears, then scrolls to the top.
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email address first. Check your inbox for a verification link.');
        await signOut(auth);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.status === 'approved') {
          console.log('User signed in and is approved!', user);
          navigate('/dashboard');
        } else if (userData.status === 'rejected') {
          setError('Your account registration has been rejected. Please contact an administrator for more information.');
          await signOut(auth);
        } else {
          setError('Your account is still pending approval by an administrator.');
          await signOut(auth);
        }
      } else {
        setError('User data not found. Please contact support.');
        await signOut(auth);
      }
    } catch (firebaseError) {
      setError('Failed to sign in. Please check your email and password.');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="bg-white shadow-2xl rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="mt-4 text-2xl font-bold text-gray-900">User Login</h2>
          </div>

          <div>
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-bold text-gray-600 block">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1" required />
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm font-bold text-gray-600 block">Password</label>
            <div className="relative mt-1">
              <input 
                id="password" 
                type={isPasswordVisible ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded" 
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
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot Password</Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!email || !password}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Sign In
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;