// src/pages/HomePage.jsx

import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="container mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
        Welcome to ARMLine
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
        A secure and confidential platform for students and parents to report school-related concerns.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
        {/* UPDATED: Now points to the public anonymous report page */}
        <Link to="/anonymous-report" className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 w-full sm:w-auto">
          Submit a Report
        </Link>
        {/* UPDATED: Fixed the route to match main.jsx */}
        <Link to="/check-status" className="px-8 py-3 bg-white text-blue-700 font-medium rounded-full shadow-lg border hover:bg-gray-50 w-full sm:w-auto">
          Track a Report
        </Link>
      </div>
    </div>
  );
}

export default HomePage;