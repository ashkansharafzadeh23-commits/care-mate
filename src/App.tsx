import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { useAuthContext } from './context/AuthContext';
import { Home, HeartPulse, MessageSquare, Settings } from 'lucide-react';
import { cn } from './lib/utils';
import { useTranslation } from 'react-i18next';

// Auth Pages & Route Protection
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Family & Application Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import CareRecipientProfilePage from './pages/CareRecipientProfilePage';
import ChatPage from './pages/ChatPage';
import MatchResultsPage from './pages/MatchResultsPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import FindCareMapPage from './pages/FindCareMapPage';
import ProviderOnboardingPage from './pages/ProviderOnboardingPage';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthContext();

  const navItems = [
    { path: '/home', icon: Home, label: t('nav.home') },
    { path: '/dashboard', icon: HeartPulse, label: t('nav.dashboard') },
    { path: '/chat', icon: MessageSquare, label: t('nav.chat') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  // Only display family navigation bar when user is authenticated as family and not in flow pages
  if (!isAuthenticated || user?.role !== 'family') {
    return null;
  }

  const hideNavPaths = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/unauthorized',
    '/onboarding',
    '/chat',
    '/results',
    '/book',
    '/provider-signup',
    '/provider-onboarding',
    '/provider-dashboard',
    '/admin'
  ];

  if (hideNavPaths.some(p => location.pathname === p || location.pathname.startsWith('/book/'))) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary-600" : "text-text-500 hover:text-text-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-surface-50 font-sans text-text-900 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-sm overflow-x-hidden">
        <main className="pb-20 min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/provider-signup" element={<Navigate to="/signup?role=provider" replace />} />

            {/* Family Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute allowedRoles={['family']}>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute allowedRoles={['family']}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/care/:recipientId"
              element={
                <ProtectedRoute allowedRoles={['family']}>
                  <CareRecipientProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/care"
              element={
                <ProtectedRoute allowedRoles={['family']}>
                  <CareRecipientProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['family']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/find-care"
              element={
                <ProtectedRoute allowedRoles={['family']}>
                  <FindCareMapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['family']}>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute allowedRoles={['family']}>
                  <MatchResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/:id"
              element={
                <ProtectedRoute allowedRoles={['family']}>
                  <BookingPage />
                </ProtectedRoute>
              }
            />

            {/* Provider Protected Routes */}
            <Route
              path="/provider-dashboard"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider-onboarding"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderOnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Authenticated Global Routes (all roles) */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
