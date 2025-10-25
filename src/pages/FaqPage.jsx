// src/pages/FaqPage.jsx
import { useState } from 'react';

/* ============================
   Small reusable components
   ============================ */
// Copied directly from ResourcesPage.jsx
const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none"
      >
        <span>{title}</span>
        <svg className={`w-5 h-5 text-gray-500 transition-transform transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-5 pt-0"><div className="prose prose-sm max-w-none text-gray-600">{children}</div></div>}
    </div>
  );
};


/* ============================
   Main Faq Page Component
   ============================ */
export default function FaqPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Answers to common questions about using ARMLine and the reporting process.
            </p>
          </div>

          {/* FAQ Accordion Section */}
          {/* Moved from ResourcesPage.jsx */}
          <div id="faq" className="mb-12">
            {/* Removed h2 title as it's redundant with the page title */}
            <div className="space-y-4">
              <AccordionItem title="Can I really report anonymously?">
                <p>Yes. When you submit an anonymous report, your name and personal details are not attached. The administrator will only see the details of the incident itself.</p>
              </AccordionItem>
              <AccordionItem title="Will the person I report know it was me?">
                <p>Your privacy is a top priority. School administrators are trained to handle reports with confidentiality. If you report anonymously, your identity is protected.</p>
              </AccordionItem>
              <AccordionItem title="What if my concern doesn’t fit a category?">
                <p>Please choose the category that seems closest to your issue. You can provide full details in the description box, which is the most important part of your report.</p>
              </AccordionItem>
              {/* Add more common questions here as needed */}
               <AccordionItem title="Who sees my report?">
                <p>Reports are directed to designated school personnel, such as guidance counselors, discipline officers, or administrators, depending on the category and school policy. Mental health reports often go directly to counselors with higher confidentiality.</p>
              </AccordionItem>
               <AccordionItem title="What happens after I submit a report?">
                <p>The report is reviewed by the appropriate school staff. They will investigate according to school policy. You can track the status (Submitted, Under Review, Action Taken, Resolved) using your Case ID (for anonymous reports) or via your dashboard (for verified reports).</p>
              </AccordionItem>
               <AccordionItem title="How long does it take for a report to be addressed?">
                <p>Response times vary depending on the severity and complexity of the report, as well as school procedures. Urgent matters like violence are typically addressed immediately, while other cases may take time to investigate properly.</p>
              </AccordionItem>
            </div>
          </div>
          {/* End of Moved FAQ Section */}

        </div>
      </div>
    </main>
  );
}