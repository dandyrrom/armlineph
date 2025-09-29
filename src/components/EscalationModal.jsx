// src/components/EscalationModal.jsx
import { useState } from 'react';

function EscalationModal({ isOpen, onClose, onEscalate, report }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    const agency = formData.get('agency');
    const notes = formData.get('notes');

    // Call the function passed from the parent page
    await onEscalate(agency, notes);

    setIsSubmitting(false);
    onClose(); // Close the modal after submission
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative w-full max-w-lg p-4 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">Escalate Report: {report.caseId}</h3>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="agency" className="text-sm font-bold text-gray-700 block mb-2">Select Agency</label>
            <select id="agency" name="agency" className="w-full p-3 border border-gray-300 rounded-lg" defaultValue="" required>
              <option value="" disabled>Choose an authority...</option>
              <option value="DSWD">Department of Social Welfare and Development (DSWD)</option>
              <option value="PNP">Philippine National Police (PNP)</option>
              <option value="DepEd">Department of Education (DepEd)</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="text-sm font-bold text-gray-700 block mb-2">Escalation Notes</label>
            <textarea id="notes" name="notes" rows="4" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Add any relevant notes for the escalation..." required></textarea>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-semibold" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Escalation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EscalationModal;