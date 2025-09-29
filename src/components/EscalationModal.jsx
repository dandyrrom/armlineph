// src/components/EscalationModal.jsx

function EscalationModal({ isOpen, onClose }) {
    if (!isOpen) {
      return null;
    }
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log("Escalation form submitted!");
      // We will add the logic to send the escalation later.
      onClose(); // Close the modal for now
    };
  
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-lg p-4 bg-white rounded-2xl shadow-xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h3 className="text-xl font-bold text-gray-900" id="modal-title">
              Escalate Report
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="agency" className="text-sm font-bold text-gray-700 block mb-2">
                Select Agency
              </label>
              <select
                id="agency"
                name="agency"
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="" disabled selected>Choose an authority...</option>
                <option value="DSWD">Department of Social Welfare and Development (DSWD)</option>
                <option value="PNP">Philippine National Police (PNP)</option>
                <option value="DepEd">Department of Education (DepEd)</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="text-sm font-bold text-gray-700 block mb-2">
                Escalation Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Add any relevant notes for the escalation..."
                required
              ></textarea>
            </div>
  
            {/* Modal Footer */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
              >
                Send Escalation
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  export default EscalationModal;