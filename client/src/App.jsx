import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import EncryptionPage from './pages/EncryptionPage';
import HashPage from './pages/HashPage';
import RSAPage from './pages/RSAPage';
import ChatPage from './pages/ChatPage';
import FirewallPage from './pages/FirewallPage';
import IDSPage from './pages/IDSPage';
import LearningPage from './pages/LearningPage';
import BirthdayPage from './pages/BirthdayPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

// App layout with sidebar
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/encrypt" element={<EncryptionPage />} />
              <Route path="/hash" element={<HashPage />} />
              <Route path="/rsa" element={<RSAPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/firewall" element={<FirewallPage />} />
              <Route path="/ids" element={<IDSPage />} />
              <Route path="/learn" element={<LearningPage />} />
              <Route path="/birthday" element={<BirthdayPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1B2336',
              color: '#F1F5F9',
              border: '1px solid rgba(34,197,94,0.18)',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: '"JetBrains Mono", monospace',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#052E16' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#1B2336' } },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
