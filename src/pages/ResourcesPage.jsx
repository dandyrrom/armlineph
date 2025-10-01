// src/pages/ResourcesPage.jsx
import { useEffect, useRef, useState } from 'react';

/* ============================
   Categories data
   ============================ */
const categoriesData = [
  { title: "Administrative Misconduct", content: "Actions by school officials or staff that are unethical, unprofessional, or violate school policy. These reports are handled by higher-level administrators.", example: 'Example: "A school official is showing favoritism and giving unfair advantages to certain students."' },
  { title: "Cyberbullying", content: "Bullying that occurs online through social media, messaging apps, or other digital platforms. This is taken very seriously and is often handled by a Discipline Officer.", example: 'Example: "Someone is spreading false rumors about me in a group chat."' },
  { title: "Discrimination", content: "Being treated unfairly or differently because of your race, religion, gender, disability, or other personal characteristics. These reports are reviewed by school administration.", example: 'Example: "I was not allowed to join a school club because of my religion."' },
  { title: "Harassment", content: "Unwanted and repeated behavior that is offensive, intimidating, or hostile. This can be verbal, physical, or visual.", example: 'Example: "A student constantly makes inappropriate jokes and comments that make me feel uncomfortable."' },
  { title: "Mental Health Risks", content: "Concerns about a student's emotional or psychological well-being, such as severe anxiety, depression, self-harm, or suicidal thoughts. These reports are highly confidential and go directly to a Guidance Counselor.", example: 'Example: "My friend seems very sad all the time and has mentioned wanting to hurt themselves."', note: "Note: If you believe someone is in immediate danger of harming themselves, please contact an emergency hotline immediately." },
  { title: "Negligence", content: "A failure by school staff to provide a reasonable level of care, resulting in a student's injury or harm.", example: 'Example: "A teacher left the classroom unsupervised, and a student got injured as a result."' },
  { title: "Physical Altercation / Violence", content: "An incident involving a physical fight or act of violence between two or more individuals. These are urgent reports handled by school security and administrators.", example: 'Example: "I witnessed a fight between two students near the school gate."' },
  { title: "Physical Bullying", content: "Repeated physical actions intended to cause harm or intimidation. Handled by the Discipline Officer and Guidance Counselor.", example: 'Example: "A student keeps pushing me and knocking my books out of my hands."' },
  { title: "Safety Hazard", content: "Any condition on school grounds that could potentially cause injury or harm, such as broken equipment or unsafe areas.", example: 'Example: "The stairs in the west wing are slippery and have a broken handrail."' },
  { title: "Sexual Misconduct", content: "Any unwelcome behavior of a sexual nature. This is a very serious offense handled with extreme confidentiality by senior administrators and counselors. May be escalated to external authorities.", example: 'Example: "A staff member made an inappropriate comment or touch."' },
  { title: "Social Bullying / Exclusion", content: "Actions intended to harm someone's reputation or relationships. This includes spreading rumors or deliberately excluding someone from a group.", example: 'Example: "A group of students is intentionally leaving out a classmate from all activities and telling others not to be friends with them."' },
  { title: "Substance Abuse", content: "Concerns about a student using, possessing, or distributing alcohol, tobacco, or illegal drugs on school property.", example: 'Example: "I saw a student vaping in the school bathroom."' },
  { title: "Verbal Bullying", content: "The repeated use of negative language, such as name-calling, insults, or threats, to harm another person.", example: 'Example: "A classmate makes fun of my appearance every day."' },
  { title: "VAWC-Related", content: "Acts of violence or abuse that fall under Republic Act 9262 (Violence Against Women and their Children), which can include physical, sexual, psychological, or economic abuse. These are confidential and serious reports.", example: 'Example: "A student is being threatened or harmed by a partner or family member, and it is affecting their safety at school."' }
];

/* ============================
   Small reusable components
   ============================ */
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

const HotlineEntry = ({ name, number, description }) => (
  <div>
    <p className="font-semibold text-gray-800">{name}</p>
    <p className="text-blue-600 font-mono text-lg">{number}</p>
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
);

/* ============================
   Main page
   ============================ */
export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState(categoriesData[0].title);
  const activeCategory = categoriesData.find((c) => c.title === activeTab);

  // refs + state for tab scroll affordances
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // update affordances based on scroll position/size
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    const check = () => {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    };

    check();
    el.addEventListener('scroll', check);
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  // scroll helpers
  const scrollBy = (dir = 'right') => {
    const el = tabsRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6; // scroll a chunk
    el.scrollTo({
      left: dir === 'right' ? el.scrollLeft + amount : el.scrollLeft - amount,
      behavior: 'smooth'
    });
  };

  // ensure selected tab is visible (useful for keyboard navigation)
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const selectedButton = el.querySelector('[data-active="true"]');
    if (selectedButton) {
      // bring it into view centered-ish
      const offsetLeft = selectedButton.offsetLeft;
      const offsetWidth = selectedButton.offsetWidth;
      const target = offsetLeft - (el.clientWidth - offsetWidth) / 2;
      el.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Resources & Support</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Your guide to understanding student welfare, knowing your rights, and finding help when you need it.
            </p>
          </div>

                      {/* Table of Contents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Quick Navigation
            </h2>
            <p className="text-gray-600 mb-4">Jump directly to any section of this page:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button onClick={() => {
                const element = document.getElementById('emergency');
                const offsetTop = element.offsetTop - 100;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              }} className="flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                <span className="text-lg mr-3">🚨</span>
                <span className="font-medium text-gray-800">Emergency Contacts</span>
              </button>
              <button onClick={() => {
                const element = document.getElementById('reporting-process');
                const offsetTop = element.offsetTop - 100;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              }} className="flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                <span className="text-lg mr-3">📋</span>
                <span className="font-medium text-gray-800">How Reporting Works</span>
              </button>
              <button onClick={() => {
                const element = document.getElementById('categories');
                const offsetTop = element.offsetTop - 100;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              }} className="flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                <span className="text-lg mr-3">📂</span>
                <span className="font-medium text-gray-800">Incident Categories</span>
              </button>
              <button onClick={() => {
                const element = document.getElementById('anti-bullying');
                const offsetTop = element.offsetTop - 100;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              }} className="flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                <span className="text-lg mr-3">⚖️</span>
                <span className="font-medium text-gray-800">Anti-Bullying Law</span>
              </button>
              <button onClick={() => {
                const element = document.getElementById('faq');
                const offsetTop = element.offsetTop - 100;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              }} className="flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                <span className="text-lg mr-3">❓</span>
                <span className="font-medium text-gray-800">FAQ</span>
              </button>
              <button onClick={() => {
                const element = document.getElementById('hotlines');
                const offsetTop = element.offsetTop - 100;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              }} className="flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                <span className="text-lg mr-3">📞</span>
                <span className="font-medium text-gray-800">Hotlines & Resources</span>
              </button>
            </div>
          </div>

          {/* Emergency */}
          <div id="emergency" className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-lg shadow-sm">
            <h3 className="text-xl font-bold text-red-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              In Case of Emergency
            </h3>
            <p className="mt-2 text-red-800">If you or someone you know is in immediate danger, please contact the authorities directly.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><HotlineEntry name="National Emergency Hotline" number="911" /></div>
              <div><HotlineEntry name="Dumaguete City PNP" number="(035) 225-1911" /></div>
            </div>
          </div>

          {/* How Reporting Works */}
          <div id="reporting-process" className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">How Reporting Works: A Step-by-Step Guide</h2>
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-4">1</span>
                <span><b>Submit Your Report:</b> Fill out the report form (verified or anonymous). Provide as much detail as possible. You will receive a unique Case ID.</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-4">2</span>
                <span><b>Admin Review:</b> Your report is sent confidentially to designated school personnel (like a guidance counselor or administrator) for review.</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-4">3</span>
                <span><b>Track Progress:</b> Use your Case ID on the "Track a Report" page to see status updates and messages from the administrator.</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-4">4</span>
                <span><b>Action & Resolution:</b> The school takes appropriate action based on their policies. The status will be updated until the case is resolved.</span>
              </li>
            </ol>
          </div>

          {/* Choosing the Right Category - improved UI */}
          <div id="categories" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Choosing the Right Category</h2>
            <p className="text-center text-gray-600 mb-4">Tap/swipe or use the arrows to browse categories. Selecting a category shows its details below.</p>

            <div className="relative">
              {/* left chevron - visible on md+ */}
              {canScrollLeft && (
                <button
                  aria-label="Scroll categories left"
                  onClick={() => scrollBy('left')}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 15.707a1 1 0 01-1.414 0L5.172 10l5.707-5.707a1 1 0 011.414 1.414L8.414 10l3.879 3.879a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}

            {/* right chevron - visible on md+ */}
            {canScrollRight && (
            <button
                aria-label="Scroll categories right"
                onClick={() => scrollBy('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md focus:outline-none"
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                >
                <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                />
                </svg>
            </button>
            )}



              {/* scrollable tab list */}
              <div
                ref={tabsRef}
                className="relative no-scrollbar overflow-x-auto whitespace-nowrap py-2 scroll-smooth"
                style={{ WebkitOverflowScrolling: 'touch' }}
                aria-label="Category tabs"
              >
                <div className="flex items-center space-x-3 px-4">
                  {categoriesData.map((cat) => {
                    const isActive = cat.title === activeTab;
                    return (
                      <button
                        key={cat.title}
                        data-active={isActive ? 'true' : 'false'}
                        onClick={() => setActiveTab(cat.title)}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300
                          ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
                        style={{ minWidth: 160 }} // keep some tabs partial on smaller screens
                        aria-pressed={isActive}
                      >
                        {cat.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* left fade */}
              <div aria-hidden className={`pointer-events-none absolute left-0 top-0 h-full w-14 transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }} />

              {/* right fade */}
              <div aria-hidden className={`pointer-events-none absolute right-0 top-0 h-full w-14 transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }} />

              {/* subtle bottom inner shadow to indicate scrolling area (CSS shadow) */}
              <div className="absolute left-0 right-0 bottom-0 h-6 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.03))' }} />
            </div>

            {/* Selected category card */}
            {activeCategory && (
              <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{activeCategory.title}</h3>
                <p className="text-gray-600">{activeCategory.content}</p>
                <p className="mt-4 text-sm bg-blue-50 p-3 rounded-md border border-blue-100"><b>{activeCategory.example}</b></p>
                {activeCategory.note && <p className="mt-4 text-xs font-semibold text-red-600">{activeCategory.note}</p>}
              </div>
            )}
          </div>

          {/* RA 10627 section (unchanged) */}
          <div id="anti-bullying" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Understanding the Anti-Bullying Act (RA 10627)</h2>
            <div className="space-y-4">
              <AccordionItem title="What is RA 10627?">
                <p>It's a law that requires all elementary and secondary schools in the Philippines to adopt policies to prevent and address acts of bullying. Its goal is to protect students and create a safer learning environment.</p>
                <a href="https://www.officialgazette.gov.ph/2013/09/12/republic-act-no-10627/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Read the full official document ↗</a>
              </AccordionItem>
              <AccordionItem title="What are my school's responsibilities?">
                <p>Under this law, your school must create and enforce an anti-bullying policy, establish a committee to handle cases, provide a way to report bullying confidentially, and respond to reports promptly.</p>
              </AccordionItem>
            </div>
          </div>

          {/* FAQ */}
          <div id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Frequently Asked Questions (FAQ)</h2>
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
            </div>
          </div>

          {/* Hotlines */}
          <div id="hotlines">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Helpful Hotlines & Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">National Hotlines</h3>
                <div className="space-y-4">
                  <HotlineEntry name="National Mental Health Crisis Hotline" number="1553" description="For Luzon. Toll-free for LANDLINE users." />
                  <HotlineEntry name="PNP Anti-Cybercrime Group" number="(02) 8723-0401 loc 7491" description="For reporting cybercrime and online harassment." />
                  <HotlineEntry name="DSWD" number="(02) 8931-8101" description="Department of Social Welfare and Development." />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dumaguete City Hotlines</h3>
                <div className="space-y-4">
                  <HotlineEntry name="DSWD Dumaguete Office" number="(035) 225-0720" />
                  <HotlineEntry name="City Social Welfare & Dev't Office" number="(035) 225-0720" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Local styles for hiding scrollbar (works across browsers) */}
      <style jsx>{`
        /* hide scrollbar but keep scroll functionality */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
