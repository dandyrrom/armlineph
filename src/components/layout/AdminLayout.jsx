// src/components/AdminLayout.jsx

import { Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

// Simple Header Component
function AdminHeader() {
  const navigate = useNavigate();

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
        <h1 className="text-xl font-bold text-gray-800">ARMLine Admin</h1>
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

// Simple Footer Component
function AdminFooter() {
  return (
    <footer className="bg-white mt-auto">
      <div className="container mx-auto px-6 py-4 text-center text-gray-500">
        <p>© 2025 ARMLine. All rights reserved.</p>
      </div>
    </footer>
  );
}


// The Layout component that arranges everything
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