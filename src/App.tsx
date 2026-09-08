import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { Home, HeartPulse, MessageSquare, Settings } from 'lucide-react';
import { cn } from './lib/utils';
import { useTranslation } from 'react-i18next';

// Lazy loading or direct imports (we'll just use direct for MVP simplicity)
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
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

  const navItems = [
    { path: '/home', icon: Home, label: t('nav.home') },
    { path: '/dashboard', icon: HeartPulse, label: t('nav.dashboard') },
    { path: '/chat', icon: MessageSquare, label: t('nav.chat') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  // Don't show nav on onboarding, chat, or booking flows for focus
  const hideNavPaths = ['/', '/onboarding', '/chat', '/results', '/book', '/provider-signup'];
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
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/provider-signup" element={<ProviderOnboardingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/find-care" element={<FindCareMapPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/results" element={<MatchResultsPage />} />
            <Route path="/book/:id" element={<BookingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
