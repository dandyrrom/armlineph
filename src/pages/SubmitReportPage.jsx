// src/pages/SubmitReportPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { db, getCategories } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

function SubmitReportPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State for new structured fields
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [location, setLocation] = useState('');
  const [partiesInvolved, setPartiesInvolved] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');

  // Existing state
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSchool, setUserSchool] = useState('');
  const [isLoadingSchool, setIsLoadingSchool] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!currentUser) {
        setIsLoadingSchool(false);
        return;
      }
      setIsLoadingSchool(true);
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserSchool(userDocSnap.data().school);
        } else { setError("Could not load your profile information."); }
        
        const categoriesList = await getCategories();
        setCategories(categoriesList);
      } catch (err) {
        console.error("Error fetching initial data: ", err);
        setError("Failed to load required form data.");
      } finally {
        setIsLoadingSchool(false);
      }
    };
    fetchInitialData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!category || !incidentDate || !location || description.trim().length < 10) {
      setError('Please fill out all required fields marked with an asterisk (*).');
      return;
    }
    setIsSubmitting(true);

    try {
      // Find the selected category object to get its priority
      const selectedCategoryObject = categories.find(c => c.name === category);
      const priority = selectedCategoryObject ? selectedCategoryObject.priority : 'Medium'; // Default priority

      const imageUrls = [];
      if (imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          const formData = new FormData();
          formData.append('key', import.meta.env.VITE_IMGBB_API_KEY);
          formData.append('image', imageFile);
          const response = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
          const result = await response.json();
          if (result.success) imageUrls.push(result.data.url);
          else throw new Error(result.error.message || 'Image upload failed');
        }
      }

      const newReportRef = await addDoc(collection(db, "reports"), {
        school: userSchool, category, description, imageUrls, videoUrl: videoUrl.trim(),
        incidentDate, incidentTime, location, partiesInvolved, witnesses, desiredOutcome, // New structured fields
        priority, // The automatically assigned priority
        status: "Submitted", createdAt: new Date(), isAnonymous: isAnonymous,
        authorId: isAnonymous ? null : currentUser.uid, submittedById: currentUser.uid,
      });

      const autoId = newReportRef.id;
      const year = new Date().getFullYear().toString().slice(-2);
      const shortId = autoId.substring(0, 6).toUpperCase();
      const caseId = `ARMLN-${year}-${shortId}`;
      await updateDoc(newReportRef, { caseId });
      navigate('/dashboard');
    } catch (err) {
      setError(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image selection with previews and validation
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (files.length + imageFiles.length > 10) {
      setError('Maximum 10 images allowed per report');
      return;
    }

    // Validate file sizes (5MB limit)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed 5MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  // Remove image from selection
  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]); // Clean up memory
      return prev.filter((_, i) => i !== index);
    });
  };

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Submit a New Report</h2>
          <p className="text-sm text-gray-500 mt-1">Fields marked with * are required.</p>
        </div>
        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-600 block">School</label>
            <p className="w-full p-2 mt-1 bg-gray-100 rounded border border-gray-300 font-medium">{userSchool || 'Loading...'}</p>
          </div>
          <div>
            <label htmlFor="category" className="text-sm font-bold text-gray-600 block">Category *</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border border-gray-300 rounded mt-1" required>
              <option value="" disabled>Choose a Category</option>
              {categories.map(cat => ( <option key={cat.id} value={cat.name}>{cat.name}</option> ))}
            </select>
          </div>
          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="incidentDate" className="text-sm font-bold text-gray-600 block">Date of Incident *</label>
              <input type="date" id="incidentDate" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded mt-1" required />
            </div>
            <div>
              <label htmlFor="incidentTime" className="text-sm font-bold text-gray-600 block">Time of Incident</label>
              <input type="time" id="incidentTime" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)} className="w-full p-3 border border-gray-300 rounded mt-1" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="location" className="text-sm font-bold text-gray-600 block">Location of Incident *</label>
              <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 border border-gray-300 rounded mt-1" placeholder="e.g., Canteen, Room 201, Main Gate" required />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-bold text-gray-600 block">Description of Incident *</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" className="w-full p-3 border border-gray-300 rounded mt-1" placeholder="Please provide a detailed description of what happened..." required></textarea>
          </div>
          <div>
            <label htmlFor="partiesInvolved" className="text-sm font-bold text-gray-600 block">Parties Involved</label>
            <textarea id="partiesInvolved" value={partiesInvolved} onChange={(e) => setPartiesInvolved(e.target.value)} rows="3" className="w-full p-3 border border-gray-300 rounded mt-1" placeholder="List names or descriptions of people directly involved (optional)"></textarea>
          </div>
          <div>
            <label htmlFor="witnesses" className="text-sm font-bold text-gray-600 block">Witnesses</label>
            <textarea id="witnesses" value={witnesses} onChange={(e) => setWitnesses(e.target.value)} rows="3" className="w-full p-3 border border-gray-300 rounded mt-1" placeholder="List names or descriptions of any witnesses (optional)"></textarea>
          </div>
          <div>
            <label htmlFor="desiredOutcome" className="text-sm font-bold text-gray-600 block">Desired Outcome</label>
            <textarea id="desiredOutcome" value={desiredOutcome} onChange={(e) => setDesiredOutcome(e.target.value)} rows="3" className="w-full p-3 border border-gray-300 rounded mt-1" placeholder="What resolution are you hoping for? (e.g., speak to a counselor) (optional)"></textarea>
          </div>

          {/* ===== MEDIA UPLOAD SECTION ===== */}
          <div className="border-t pt-6">
            <p className="text-sm font-bold text-gray-600 mb-4">Evidence (Optional)</p>
            
            {/* ===== IMAGE UPLOAD WITH PREVIEWS ===== */}
            <div className="mb-6">
              <label htmlFor="imageFiles" className="text-sm font-semibold text-gray-700 block mb-2">
                Upload Images (Max 10, 5MB each)
              </label>
              <input
                id="imageFiles"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                multiple
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: PNG, JPEG, JPG. Maximum 10 images, 5MB each.
              </p>

              {/* ===== IMAGE PREVIEW THUMBNAILS ===== */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Selected images ({imagePreviews.length}/10):
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded border cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove ${imageFiles[index].name}`}
                        >
                          ×
                        </button>
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {imageFiles[index].name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatFileSize(imageFiles[index].size)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ===== VIDEO URL INPUT ===== */}
            <div>
              <label htmlFor="videoUrl" className="text-sm font-semibold text-gray-700 block mb-2">
                Video Link
              </label>
              <input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded text-sm"
                placeholder="https://youtube.com/... or https://drive.google.com/..."
              />
              <p className="text-xs text-gray-400 mt-1">
                YouTube, Google Drive, or other video sharing links
              </p>
            </div>
          </div>

          {/* ===== ANONYMOUS CHECKBOX ===== */}
          <div className="border-t pt-6">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)} 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <span className="ml-2 text-sm text-gray-600">Submit this report anonymously</span>
            </label>
            <p className="text-xs text-gray-500 ml-6 mt-1">
              If checked, your name will not be attached to this report externally.
            </p>
          </div>

          {/* ===== SUBMIT BUTTON ===== */}
          <button type="submit" disabled={isSubmitting || isLoadingSchool} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-bold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitReportPage;