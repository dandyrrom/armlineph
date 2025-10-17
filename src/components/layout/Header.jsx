// src/components/layout/Header.jsx

import { NavLink, Link, useLocation } from 'react-router-dom'; // 1. Import useLocation
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

function Header() {
  const { currentUser } = useAuth();
  const location = useLocation(); // 2. Get the current location

  // 3. Check if the current path is a registration page
  const isRegisterPage = location.pathname === '/signup' || location.pathname === '/admin/register';

  // 4. Use the original currentUser unless we're on a register page
  const displayUser = isRegisterPage ? null : currentUser;

  // Style for active NavLink
  const activeLinkStyle = {
    color: '#2563EB', // blue-600
    borderBottom: '2px solid #2563EB'
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            ARMLine
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {/* 👇 5. Use displayUser for all conditional rendering */}
          {displayUser ? (
            // Logged-in navigation
            <>
               <NavLink 
                to="/dashboard" 
                className="text-gray-600 hover:text-blue-600 font-medium pb-1"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                Dashboard
              </NavLink>
               <NavLink 
                to="/resources" 
                className="text-gray-600 hover:text-blue-600 font-medium pb-1"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                Resources
              </NavLink>
               <NavLink 
                to="/about" 
                className="text-gray-600 hover:text-blue-600 font-medium pb-1"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                About Us
              </NavLink>
            </>
          ) : (
            // Logged-out navigation
            <>
              <NavLink 
                to="/" 
                className="text-gray-600 hover:text-blue-600 font-medium pb-1"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                Home
              </NavLink>
              <NavLink 
                to="/resources" 
                className="text-gray-600 hover:text-blue-600 font-medium pb-1"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                Resources
              </NavLink>
              <NavLink 
                to="/about" 
                className="text-gray-600 hover:text-blue-600 font-medium pb-1"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                About Us
              </NavLink>
            </>
          )}
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center space-x-3">
          {/* 👇 5. Use displayUser for all conditional rendering */}
          {displayUser ? (
            <>
              <span className="text-gray-700 text-sm font-medium hidden sm:block">Welcome!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-gray-700 font-medium hover:text-blue-700 text-sm">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;