// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- Import Components ---
import App from './App.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import SuperAdminRoute from './components/SuperAdminRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

// --- Import Public Pages ---
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import AnonymousReportPage from './pages/AnonymousReportPage.jsx';
import CheckStatusPage from './pages/CheckStatusPage.jsx';
import ResourcesPage from './pages/ResourcesPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import FaqPage from './pages/FaqPage.jsx'; // <-- IMPORT FAQ PAGE
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';


// --- Import Authenticated User Pages ---
import DashboardPage from './pages/DashboardPage.jsx';
import SubmitReportPage from './pages/SubmitReportPage.jsx';
import ReportDetailsPage from './pages/ReportDetailsPage.jsx';

// --- Import Admin Pages ---
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminRegisterPage from './pages/admin/AdminRegisterPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminReportDetailsPage from './pages/admin/AdminReportDetailsPage.jsx';
import AccountManagementPage from './pages/admin/AccountManagementPage.jsx';
import AccountDetailsPage from './pages/admin/AccountDetailsPage.jsx';
import AdminForgotPasswordPage from './pages/admin/AdminForgotPasswordPage.jsx';


import './index.css';

const router = createBrowserRouter([

  // --- Admin Routes ---
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { path: "reports", element: <AdminDashboard /> },
      { path: "report/:reportId", element: <AdminReportDetailsPage /> },
      {
        path: "accounts",
        children: [
          {
            index: true,
            element: (
              <SuperAdminRoute>
                <AccountManagementPage />
              </SuperAdminRoute>
            )
          },
          {
            path: ":userId",
            element: (
              <SuperAdminRoute>
                <AccountDetailsPage />
              </SuperAdminRoute>
            )
          }
        ]
      },
    ],
  },
  { path: "/admin/login", element: <AdminLoginPage /> },
  { path: "/admin/register", element: <AdminRegisterPage /> },
  { path: "/admin/forgot-password", element: <AdminForgotPasswordPage /> },

  // --- Public and Authenticated User Routes (Main Layout) ---
  {
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "resources", element: <ResourcesPage /> },
      { path: "about", element: <AboutUsPage /> },
      { path: "faq", element: <FaqPage /> }, // <-- ADD FAQ ROUTE
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "anonymous-report", element: <AnonymousReportPage /> },
      { path: "check-status", element: <CheckStatusPage /> },

      // --- PROTECTED ROUTES ---
      { path: "dashboard", element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: "submit-report", element: <ProtectedRoute><SubmitReportPage /></ProtectedRoute> },
      { path: "report/:reportId", element: <ProtectedRoute><ReportDetailsPage /></ProtectedRoute> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);