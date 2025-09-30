// src/components/layout/AdminLayout.jsx

import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useUserInfo } from '../../hooks/useUserInfo'; // <-- IMPORT OUR NEW HOOK

// We need to pass NavLink styles down, so we define it here
const activeLinkStyle = {
  backgroundColor: '#4F46E5', // indigo-600
  color: 'white',
};

// The Header is now a more complex component, so we move it inside AdminLayout
function AdminHeader() {
  const navigate = useNavigate();
  const { userInfo, isLoading } = useUserInfo(); // <-- USE THE HOOK

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error("Failed to log out: ", error);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ARMLine Admin</h1>
          {/* --- NEW: Conditional Navigation Links --- */}
          <nav className="mt-2 flex items-center gap-2">
            <NavLink
              to="/admin/reports"
              className="px-3 py-1 text-sm font-semibold text-gray-600 rounded-md hover:bg-gray-200"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Reports Dashboard
            </NavLink>

            {/* This link only appears if the user is a superAdmin */}
            {!isLoading && userInfo?.role === 'superAdmin' && (
              <NavLink
                to="/admin/accounts"
                className="px-3 py-1 text-sm font-semibold text-gray-600 rounded-md hover:bg-gray-200"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                Account Management
              </NavLink>
            )}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

// Simple Footer Component (Unchanged)
function AdminFooter() {
  return (
    <footer className="bg-white mt-auto">
      <div className="container mx-auto px-6 py-4 text-center text-gray-500">
        <p>© 2025 ARMLine. All rights reserved.</p>
      </div>
    </footer>
  );
}

// The Layout component that arranges everything (Unchanged)
function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Outlet /> {/* This is where the specific page content will be rendered */}
      </main>
      <AdminFooter />
    </div>
  );
}

export default AdminLayout;