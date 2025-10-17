// src/pages/SignUpPage.jsx

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
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
  const [relatedStudentName, setRelatedStudentName] = useState('');
  const [verificationImageAsBase64, setVerificationImageAsBase64] = useState('');
  const [personalIdAsBase64, setPersonalIdAsBase64] = useState('');
  const [studentIdAsBase64, setStudentIdAsBase64] = useState('');
  const [guardianshipProofAsBase64, setGuardianshipProofAsBase64] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [schools, setSchools] = useState([]);
  const verificationFileRef = useRef(null);
  const personalIdFileRef = useRef(null);
  const studentIdFileRef = useRef(null);
  const guardianshipProofFileRef = useRef(null);

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

  // --- THIS IS THE FIX ---
  // This effect runs only when a message appears, then scrolls to the top.
  useEffect(() => {
    if (error || successMessage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error, successMessage]);
  // --- END FIX ---

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Removed the scroll from here

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    const isParent = userType === 'Parent or Legal Guardian';
    if (isParent) {
      if (!personalIdAsBase64 || !studentIdAsBase64 || !guardianshipProofAsBase64 || !relatedStudentName.trim()) {
        setError('Please fill out all required fields, including student name and all three documents.');
        return;
      }
    } else {
      if (!verificationImageAsBase64) {
        setError('Please upload your verification document to proceed.');
        return;
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      const userDocRef = doc(db, "users", user.uid);

      const userData = {
        fullName: fullName,
        email: email,
        userType: userType,
        school: school,
        status: "pending",
        createdAt: new Date(),
      };

      if (isParent) {
        userData.personalIdImage = personalIdAsBase64;
        userData.studentIdImage = studentIdAsBase64;
        userData.guardianshipProofImage = guardianshipProofAsBase64;
        userData.relatedStudentName = relatedStudentName.trim();
      } else {
        userData.verificationImage = verificationImageAsBase64;
      }

      await setDoc(userDocRef, userData);
      
      await signOut(auth);

      setSuccessMessage('Request submitted! Please check your email to verify your address. Your account will remain pending until an admin approves your documents.');
      
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUserType('Student');
      setSchool('');
      setRelatedStudentName('');
      setVerificationImageAsBase64('');
      setPersonalIdAsBase64('');
      setStudentIdAsBase64('');
      setGuardianshipProofAsBase64('');

      if (verificationFileRef.current) verificationFileRef.current.value = null;
      if (personalIdFileRef.current) personalIdFileRef.current.value = null;
      if (studentIdFileRef.current) studentIdFileRef.current.value = null;
      if (guardianshipProofFileRef.current) guardianshipProofFileRef.current.value = null;

    } catch (firebaseError) {
      setError(firebaseError.message);
    } 
  };

  const isSubmitDisabled = () => {
    if (!!passwordError || !fullName || !email || !password || !school) {
      return true;
    }
    if (userType === 'Parent or Legal Guardian') {
      return !personalIdAsBase64 || !studentIdAsBase64 || !guardianshipProofAsBase64 || !relatedStudentName.trim();
    }
    return !verificationImageAsBase64;
  };


  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSignUp} className="bg-white shadow-2xl rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {userType === 'Student' ? 'Create Student Account' : 'Create Parent/Guardian Account'}
            </h2>
          </div>

          <div>
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
            {successMessage && <p className="text-green-700 text-sm text-center bg-green-100 p-3 rounded-md">{successMessage}</p>}
          </div>

          {/* ... other form fields are unchanged ... */}
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

          {userType === 'Student' ? (
            <div>
              <label htmlFor="verificationFile" className="text-sm font-bold text-gray-600 block">Verification Document</label>
              <p className="text-xs text-gray-500 mb-1">Please upload your School ID or Registration Form.</p>
              <input
                id="verificationFile"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => handleFileChange(e, setVerificationImageAsBase64)}
                ref={verificationFileRef}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="relatedStudentName" className="text-sm font-bold text-gray-600 block">Full Name of Related Student</label>
                <input 
                  id="relatedStudentName" 
                  type="text" 
                  value={relatedStudentName} 
                  onChange={(e) => setRelatedStudentName(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded mt-1" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="personalIdFile" className="text-sm font-bold text-gray-600 block">Your Personal ID</label>
                <p className="text-xs text-gray-500 mb-1">Upload a valid government-issued ID (e.g., Driver's License, Passport).</p>
                <input
                  id="personalIdFile"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => handleFileChange(e, setPersonalIdAsBase64)}
                  ref={personalIdFileRef}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
              
              {/* --- NEW STUDENT ID UPLOAD FIELD --- */}
              <div>
                <label htmlFor="studentIdFile" className="text-sm font-bold text-gray-600 block">Student's School ID</label>
                <p className="text-xs text-gray-500 mb-1">Upload the School ID of the student you are representing.</p>
                <input
                  id="studentIdFile"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => handleFileChange(e, setStudentIdAsBase64)}
                  ref={studentIdFileRef}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <div>
                <label htmlFor="guardianshipProofFile" className="text-sm font-bold text-gray-600 block">Proof of Relationship</label>
                <p className="text-xs text-gray-500 mb-1">Upload the student's Birth Certificate or other legal proof of guardianship.</p>
                <input
                  id="guardianshipProofFile"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => handleFileChange(e, setGuardianshipProofAsBase64)}
                  ref={guardianshipProofFileRef}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={isSubmitDisabled()} 
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