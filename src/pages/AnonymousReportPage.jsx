// src/pages/AnonymousReportPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { db, getSchools, getCategories } from '../services/firebase'; // <-- IMPORT getCategories

function AnonymousReportPage() {
  const [school, setSchool] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]); 
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState(null);
  const [schools, setSchools] = useState([]);
  const [categories, setCategories] = useState([]); // <-- NEW STATE FOR CATEGORIES

  useEffect(() => {
    // Fetch both schools and categories when the component mounts
    const fetchData = async () => {
      try {
        const schoolsList = await getSchools();
        setSchools(schoolsList);
        const categoriesList = await getCategories();
        setCategories(categoriesList);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("Could not load form data. Please refresh the page.");
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imageFiles.length > 10) {
      setError('You can upload a maximum of 10 images.');
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- UPDATED: handleSubmit function with full logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 10 || !school || !category) {
      setError('Please fill out all required fields (School, Category, and Description).');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const imageUrls = []; // To store the URLs of uploaded images

      // Loop through each selected file and upload it
      if (imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          const formData = new FormData();
          formData.append('key', import.meta.env.VITE_IMGBB_API_KEY);
          formData.append('image', imageFile);

          const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            imageUrls.push(result.data.url); // Add the URL to our array
          } else {
            throw new Error(result.error.message || 'An image upload failed');
          }
        }
      }

      // Create the new report document in Firestore
      const newReportRef = await addDoc(collection(db, "reports"), {
        school,
        category,
        description,
        imageUrls, // Save the array of image URLs
        videoUrl: videoUrl.trim(),
        status: "Submitted",
        createdAt: new Date(),
        isAnonymous: true,
        authorId: null,
      });

      // Generate and save the Case ID
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
    return (
       <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-green-600">Report Submitted Successfully!</h2>
          <p className="mt-4 text-gray-600">Please save the following Case ID. This is the **only** way you can track the status of your anonymous report.</p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Your Case ID:</p>
            <p className="text-2xl font-bold text-blue-600 tracking-wider mt-1">{submittedCaseId}</p>
          </div>
          <p className="mt-4 text-xs text-red-600 font-semibold">WARNING: If you lose this ID, you will not be able to check the status of your report.</p>
          <Link to="/" className="mt-8 inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700">Return to Home</Link>
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
          <div>
            <label htmlFor="school" className="text-sm font-bold text-gray-600 block">School</label>
            <select id="school" value={school} onChange={(e) => setSchool(e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1" required disabled={schools.length === 0}>
              <option value="" disabled>Choose a school</option>
              {schools.length === 0 ? <option>Loading schools...</option> : schools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="text-sm font-bold text-gray-600 block">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1" required>
              <option value="" disabled>Choose a category</option>
              {categories.length === 0 ? (
                <option disabled>Loading categories...</option>
              ) : (
                categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <label htmlFor="description" className="text-sm font-bold text-gray-600 block">Description of Incident</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" className="w-full p-2 border border-gray-300 rounded mt-1" required></textarea>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-bold text-gray-600">Evidence (Optional)</p>
            <div className="mt-2">
              <label htmlFor="imageFiles" className="text-xs font-semibold text-gray-500 block">Upload Images (Max 10)</label>
              <input id="imageFiles" type="file" accept="image/png, image/jpeg" multiple onChange={handleImageChange} className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Selected images ({imagePreviews.length}/10):</p>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove image`}>×</button>
                      <div className="text-xs text-gray-500 truncate mt-1" title={imageFiles[index].name}>{imageFiles[index].name}</div>
                      <div className="text-xs text-gray-400">{formatFileSize(imageFiles[index].size)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2">
              <label htmlFor="videoUrl" className="text-xs font-semibold text-gray-500 block">Paste Video Link (e.g., Google Drive, YouTube)</label>
              <input id="videoUrl" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded" placeholder="https://..." />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-bold disabled:bg-gray-400">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AnonymousReportPage;