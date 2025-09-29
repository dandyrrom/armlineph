// src/pages/AboutUsPage.jsx

function AboutUsPage() {
    return (
      <div className="flex flex-col min-h-screen">
          {/* Main Content Area */}
          <main className="flex-grow">
              {/* Hero Section */}
              <section className="bg-gray-50 py-16 md:py-20 text-center">
                  <div className="container mx-auto px-6">
                      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Our Mission</h1>
                      <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                          To create safer school environments by providing a secure, reliable, and accessible channel for students to voice their concerns and receive the support they need.
                      </p>
                  </div>
              </section>
  
              {/* "How It Works" Section */}
              <section className="py-16 md:py-20 bg-white">
                  <div className="container mx-auto px-6">
                      <div className="text-center mb-12">
                          <h2 className="text-3xl font-bold text-gray-800">How ARMLine Works</h2>
                          <p className="mt-2 text-gray-600">A simple, confidential process in three steps.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                          {/* Step 1 */}
                          <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg">
                              <div className="text-4xl mb-4">1️⃣</div>
                              <h3 className="text-xl font-semibold text-gray-800">Submit Securely</h3>
                              <p className="mt-2 text-gray-600">Choose to report with your verified account or submit anonymously. Describe the incident and add evidence if you can.</p>
                          </div>
                          {/* Step 2 */}
                          <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg">
                              <div className="text-4xl mb-4">2️⃣</div>
                              <h3 className="text-xl font-semibold text-gray-800">Admin Review</h3>
                              <p className="mt-2 text-gray-600">Your report is sent directly to the designated school administrators who will review the case confidentially.</p>
                          </div>
                          {/* Step 3 */}
                          <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg">
                              <div className="text-4xl mb-4">3️⃣</div>
                              <h3 className="text-xl font-semibold text-gray-800">Track Progress</h3>
                              <p className="mt-2 text-gray-600">Follow the status of your case using your unique Case ID or through your user dashboard for real-time updates.</p>
                          </div>
                      </div>
                  </div>
              </section>
              
              {/* Our Principles Section */}
              <section className="bg-gray-50 py-16 md:py-20">
                  <div className="container mx-auto px-6 max-w-5xl">
                       <div className="text-center mb-12">
                          <h2 className="text-3xl font-bold text-gray-800">Our Principles</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="text-center">
                              <h3 className="text-xl font-semibold text-gray-800">🔒 Confidentiality</h3>
                              <p className="mt-2 text-gray-600">Your privacy is our priority. We provide options for anonymity and ensure your data is protected.</p>
                          </div>
                           <div className="text-center">
                              <h3 className="text-xl font-semibold text-gray-800">🛡️ Safety</h3>
                              <p className="mt-2 text-gray-600">We believe every student has the right to a safe learning environment, free from harm and fear.</p>
                          </div>
                           <div className="text-center">
                              <h3 className="text-xl font-semibold text-gray-800">🤝 Accountability</h3>
                              <p className="mt-2 text-gray-600">We empower schools with the tools to manage reports efficiently and act responsibly.</p>
                          </div>
                      </div>
                  </div>
              </section>
  
              {/* "The Team" Section */}
              <section className="py-16 md:py-20 bg-white">
                  <div className="container mx-auto px-6">
                      <div className="text-center mb-12">
                          <h2 className="text-3xl font-bold text-gray-800">The Team</h2>
                          <p className="mt-2 text-gray-600">This project was developed by students of the College of Computer Studies.</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                          <p className="font-semibold text-lg text-gray-800">Adrian Lee S. Alacrito</p>
                          <p className="font-semibold text-lg text-gray-800">Vaughn Eric P. Magbanua</p>
                          <p className="font-semibold text-lg text-gray-800">Danni Rose C. Romo</p>
                      </div>
                  </div>
              </section>
          </main>
      </div>
    );
  }
  
  export default AboutUsPage;