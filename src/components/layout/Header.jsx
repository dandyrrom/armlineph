// src/components/layout/Header.jsx

import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

function Header() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isRegisterPage = location.pathname === '/signup' || location.pathname === '/admin/register';
  const displayUser = isRegisterPage ? null : currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const activeLinkStyle = {
    color: '#2563EB',
    borderBottom: '2px solid #2563EB'
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {/* --- THIS IS THE FIX --- */}
          {/* This link now points to the dashboard if a user is logged in, or the homepage if not. */}
          <Link 
            to={currentUser ? "/dashboard" : "/"} 
            className="text-2xl font-bold text-gray-800"
          >
            ARMLine
          </Link>
          {/* --- END FIX --- */}
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {displayUser ? (
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

        <div className="flex items-center space-x-3">
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