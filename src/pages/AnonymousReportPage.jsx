// src/pages/AnonymousReportPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { db, getSchools } from '../services/firebase';

function AnonymousReportPage() {
  const [school, setSchool] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  // NEW: State for evidence files
  const [imageFile, setImageFile] = useState(null); // To hold the image file object
  const [videoUrl, setVideoUrl] = useState(''); // To hold the video link text

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError('Please provide a description of at least 10 characters.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      let imageUrl = ''; // Start with an empty image URL

      // --- NEW: Image Upload Logic ---
      if (imageFile) {
        // FormData is the standard way to send files
        const formData = new FormData();
        formData.append('key', import.meta.env.VITE_IMGBB_API_KEY);
        formData.append('image', imageFile);

        // Send the image to the ImgBB API
        const response = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          imageUrl = result.data.url; // Get the URL of the uploaded image
        } else {
          throw new Error(result.error.message || 'Image upload failed');
        }
      }
      // --- End of Image Upload Logic ---

      const newReportRef = await addDoc(collection(db, "reports"), {
        school,
        category,
        description,
        imageUrl, // Save the image URL from ImgBB
        videoUrl, // Save the video link from the form
        status: "Submitted",
        createdAt: new Date(),
        isAnonymous: true,
        authorId: null,
      });

      const autoId = newReportRef.id;
      const year = new Date().getFullYear().toString().slice(-2);
      const shortId = autoId.substring(0, 6).toUpperCase();
      const caseId = `ARMLN-${year}-${shortId}`;

      await updateDoc(newReportRef, { caseId });

      setSubmittedCaseId(caseId);

    } catch (err) {
      setError(`Submission failed: ${err.message}`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedCaseId) {
    // The success screen remains the same
    return (
       <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-green-600">Report Submitted Successfully!</h2>
          <p className="mt-4 text-gray-600">
            Please save the following Case ID. This is the **only** way you can track the status of your anonymous report.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Your Case ID:</p>
            <p className="text-2xl font-bold text-blue-600 tracking-wider mt-1">{submittedCaseId}</p>
          </div>
          <p className="mt-4 text-xs text-red-600 font-semibold">
            WARNING: If you lose this ID, you will not be able to check the status of your report.
          </p>
          <Link to="/" className="mt-8 inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Submit an Anonymous Report</h2>
        </div>
        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* UPDATED SCHOOL SELECTION */}
          <div>
            <label htmlFor="school" className="text-sm font-bold text-gray-600 block">School</label>
            <select 
              id="school" 
              value={school} 
              onChange={(e) => setSchool(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded mt-1"
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
            <label htmlFor="category" className="text-sm font-bold text-gray-600 block">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1">
              <option value="" disabled>Choose a category</option>
              <option>Bullying</option>
              <option>Harassment</option>
              <option>Discrimination</option>
              <option>Physical Violence</option>
              <option>Mental Health Concern</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-bold text-gray-600 block">Description of Incident</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" className="w-full p-2 border border-gray-300 rounded mt-1" required></textarea>
          </div>

          {/* --- NEW EVIDENCE FIELDS --- */}
          <div className="border-t pt-4">
            <p className="text-sm font-bold text-gray-600">Evidence (Optional)</p>
            <div className="mt-2">
              <label htmlFor="imageFile" className="text-xs font-semibold text-gray-500 block">Upload Image</label>
              <input
                id="imageFile"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="mt-2">
              <label htmlFor="videoUrl" className="text-xs font-semibold text-gray-500 block">Paste Video Link (e.g., Google Drive, YouTube)</label>
              <input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
                placeholder="https://..."
              />
            </div>
          </div>
          {/* --- END OF EVIDENCE FIELDS --- */}

          <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-bold disabled:bg-gray-400">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AnonymousReportPage;