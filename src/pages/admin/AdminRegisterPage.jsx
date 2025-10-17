// src/pages/admin/AdminRegisterPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { auth, db, getSchools } from '../../services/firebase'; 

function AdminRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  // --- NEW: State to hold the selected school ---
  const [school, setSchool] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

    // NEW STATE AND EFFECT TO FETCH SCHOOLS
  const [schools, setSchools] = useState([]);
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsList = await getSchools();
        setSchools(schoolsList);
      } catch (error) {
        console.error("Failed to fetch schools:", error);
      }
    };
    fetchSchools();
  }, []);

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      
      await setDoc(userDocRef, {
        fullName: fullName,
        email: email,
        department: department,
        role: "admin",
        status: "pending",
        createdAt: new Date(),
        school: school,
      });

      setSuccessMessage('Request submitted successfully! A Super Admin will review your request for approval.');

      // --- NEW: Clear the form fields after success ---
      setFullName('');
      setEmail('');
      setPassword('');
      setDepartment('');
      setSchool('');
      // You might also need to clear the confirmPassword field if you've added it
      // setConfirmPassword('');

    } catch (firebaseError) {
      setError(firebaseError.message);
      console.error("Error requesting admin access:", firebaseError);
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
          <h2 className="text-2xl font-bold text-gray-900">Request Admin Access</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your account will be pending until approved by a Super Admin.
          </p>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
        {successMessage && <p className="text-green-700 text-sm text-center bg-green-100 p-3 rounded-md">{successMessage}</p>}
        
        <form onSubmit={handleRequestAccess} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
            <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">Official School Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          </div>

          {/* UPDATED SCHOOL SELECTION */}
          <div>
            <label htmlFor="school" className="text-sm font-medium text-gray-700 block mb-1">School</label>
            <select
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled={schools.length === 0}
            >
              <option value="" disabled>Choose a school</option>
              {schools.length === 0 ? (
                <option>Loading schools...</option>
              ) : (
                schools.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="department" className="text-sm font-medium text-gray-700 block mb-1">Department</label>
            <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="" disabled>Choose a department</option>
              <option>Preschool</option>
              <option>Elementary</option>
              <option>Junior High School</option>
              <option>Senior High School</option>
            </select>
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">Create Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" minLength="6" required />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Submit Request
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/admin/login" className="font-medium text-indigo-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminRegisterPage;