// src/pages/SignUpPage.jsx

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { auth, db, getSchools } from '../services/firebase';

function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [userType, setUserType] = useState('Student');
  const [school, setSchool] = useState('');
  const [verificationImageAsBase64, setVerificationImageAsBase64] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [verificationFieldLabel, setVerificationFieldLabel] = useState('');
  const [verificationHelperText, setVerificationHelperText] = useState('');
  const [schools, setSchools] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsList = await getSchools();
        setSchools(schoolsList);
      } catch (error) {
        console.error("Failed to fetch schools:", error);
        setError("Could not load the list of schools. Please try again later.");
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    if (userType === 'Parent or Legal Guardian') {
      setVerificationFieldLabel('Proof of Guardianship');
      setVerificationHelperText('Please upload a document that verifies your relationship to the student (e.g., Student\'s ID, Birth Certificate).');
    } else {
      setVerificationFieldLabel('Verification Document');
      setVerificationHelperText('Please upload your School ID or Registration Form.');
    }
  }, [userType]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationImageAsBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    if (!verificationImageAsBase64) {
      setError('Please upload your verification document to proceed.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      const userDocRef = doc(db, "users", user.uid);

      await setDoc(userDocRef, {
        fullName: fullName,
        email: email,
        userType: userType,
        school: school,
        status: "pending",
        createdAt: new Date(),
        verificationImage: verificationImageAsBase64
      });

      setSuccessMessage('Request submitted! Please check your email to verify your address. Your account will remain pending until an admin approves your documents.');
      
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUserType('Student');
      setSchool('');
      setVerificationImageAsBase64('');
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

    } catch (firebaseError) {
      setError(firebaseError.message);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSignUp} className="bg-white shadow-2xl rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Create Student Account</h2>
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
          {successMessage && <p className="text-green-700 text-sm text-center bg-green-100 p-3 rounded-md">{successMessage}</p>}

          <div>
            <label htmlFor="fullName" className="text-sm font-bold text-gray-600 block">Full Name</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1" required />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-bold text-gray-600 block">Email Address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1" required />
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm font-bold text-gray-600 block">Password</label>
            <div className="relative">
              <input 
                id="password" 
                type={isPasswordVisible ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded mt-1" 
                minLength="6" 
                required 
              />
              {/* --- MODIFIED: Conditionally render the button --- */}
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
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-600 block">Confirm Password</label>
            <div className="relative">
              <input 
                id="confirmPassword" 
                type={isConfirmPasswordVisible ? 'text' : 'password'} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded mt-1" 
                minLength="6" 
                required 
              />
              {/* --- MODIFIED: Conditionally render the button --- */}
              {confirmPassword && (
                <button 
                  type="button" 
                  onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-gray-600"
                >
                  {isConfirmPasswordVisible ? 'HIDE' : 'SHOW'}
                </button>
              )}
            </div>
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>

          <div>
            <label htmlFor="school" className="text-sm font-bold text-gray-600 block">School</label>
            <select 
              id="school" 
              value={school} 
              onChange={(e) => setSchool(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded mt-1" 
              required
              disabled={schools.length === 0}
            >
              <option value="" disabled>Choose a school</option>
              {schools.length === 0 ? <option>Loading schools...</option> : schools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="userType" className="text-sm font-bold text-gray-600 block">I am a...</label>
            <select id="userType" value={userType} onChange={(e) => setUserType(e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1">
              <option>Student</option>
              <option>Parent or Legal Guardian</option>
            </select>
          </div>
          <div>
            <label htmlFor="verificationFile" className="text-sm font-bold text-gray-600 block">{verificationFieldLabel}</label>
            <p className="text-xs text-gray-500 mb-1">{verificationHelperText}</p>
            <input
              id="verificationFile"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={
              !!passwordError || 
              !fullName || 
              !email || 
              !password || 
              !school || 
              !verificationImageAsBase64
            } 
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Submit for Approval
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;