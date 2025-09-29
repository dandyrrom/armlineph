// src/pages/ResourcesPage.jsx
import { useState } from 'react';

// This is a reusable component for our accordion items.
// It helps keep the main page component clean.
const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none"
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-5 pt-0">
          <div className="prose max-w-none text-gray-600">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};


function ResourcesPage() {
  return (
    <main className="container mx-auto px-6 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Resources & Support</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Your guide to understanding student welfare, knowing your rights, and finding help when you need it.
          </p>
        </div>

        {/* Emergency Hotlines Section */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mb-12">
          <h3 className="text-xl font-bold text-amber-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Need Help Now?
          </h3>
          <p className="mt-2 text-amber-800">
            If you are in immediate danger, please contact the authorities. For urgent support, these hotlines are available.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-amber-800">National Hotlines</h4>
              <p className="mt-1 text-sm text-amber-900 leading-relaxed">
                <strong>Nat'l Mental Health Crisis:</strong> 1553 (Luzon), 0917-899-8727<br />
                <strong>PNP Anti-Cybercrime Group:</strong> (02) 8723-0401 loc 7491
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-amber-800">Dumaguete City Hotlines</h4>
              <p className="mt-1 text-sm text-amber-900 leading-relaxed">
                <strong>DSWD Dumaguete Office:</strong> (035) 225-0720<br />
                <strong>Dumaguete City PNP:</strong> (035) 225-1911
              </p>
            </div>
          </div>
        </div>

        {/* Accordion/Toggle Section for Articles */}
        <div className="space-y-4">
          <AccordionItem title="What is Bullying? (According to RA 10627)">
            <p>The Anti-Bullying Act (RA 10627) defines bullying as any severe or repeated use of written, verbal, or electronic expression, or a physical act or gesture, by one or more students directed at another student that has the effect of actually causing or placing the latter in reasonable fear of physical or emotional harm or damage to his property.</p>
            <p>This includes:</p>
            <ul>
              <li><strong>Physical Bullying:</strong> Punching, pushing, kicking, or any unwanted physical contact.</li>
              <li><strong>Verbal Bullying:</strong> Name-calling, teasing, or making offensive remarks.</li>
              <li><strong>Social Bullying:</strong> Spreading rumors, deliberately leaving someone out, or embarrassing someone publicly.</li>
              <li><strong>Cyberbullying:</strong> Sending hurtful messages or images online, or creating fake profiles.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Your Right to Report Anonymously">
            <p>RA 10627 requires schools to have a process for anonymous reporting. This right is crucial because it allows students to report incidents without the fear of retaliation. When you submit a report anonymously on ARMLine, your name and personal details are not attached to the report that administrators see, protecting your identity.</p>
          </AccordionItem>

          <AccordionItem title="What Happens After You File a Report?">
            <p>Once you submit a report, it is sent to the designated administrators at your school (like the Child Protection Committee). They will review the details and may take action, which could include investigating the incident, speaking with the people involved, and providing support. You can track the status of your report using your Case ID or on your dashboard if you are a verified user.</p>
          </AccordionItem>
        </div>
      </div>
    </main>
  );
}

export default ResourcesPage;