import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './hooks/useLanguage';
import { AuthProvider } from './hooks/useAuth';
import Banner from './components/Banner/Banner';
import Navbar from './components/Navbar/Navbar';
import MaintenanceBar from './components/MaintenanceBar/MaintenanceBar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/user/HomePage';
import LearningPage from './pages/user/LearningPage';
import ToolsPage from './pages/user/ToolsPage';
import PolicyPage from './pages/user/PolicyPage';
import BlogPage from './pages/user/BlogPage';
import StartupsPage from './pages/user/StartupsPage';
import AboutPage from './pages/user/AboutPage';
import ResetPasswordPage from './pages/user/ResetPasswordPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfilePage from './pages/user/UserProfilePage';
import CourseDetailPage from './pages/user/CourseDetailPage';
import ExamDetailPage from './pages/user/ExamDetailPage';
import ScrollToTop from './components/ScrollToTop';
import AuthModal from './components/AuthModal/AuthModal';
import ContactUsModal from './components/ContactUsModal/ContactUsModal';
import CursorSpotlight from './components/CursorSpotlight';
import InteractiveBackground from './components/InteractiveBackground';
import SmoothScroll from './components/SmoothScroll';
import RegistrationModal from './components/RegistrationModal/RegistrationModal';

// Lazy-load the Experience page (zero bundle cost to main site)
const ExperiencePage = lazy(() => import('./experience/ExperiencePage.tsx'));

// Layout wrapper to conditionally show/hide site components
const AppLayout = ({
  onOpenAuth,
  isAuthModalOpen,
  setIsAuthModalOpen,
  authDefaultTab,
  onOpenContact,
  isContactModalOpen,
  setIsContactModalOpen,
  onOpenRegistration,
  isRegistrationOpen,
  setIsRegistrationOpen,
}) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isExperiencePage = location.pathname.startsWith('/experience');
  const isIsolatedPage = isAdminPage || isExperiencePage;

  return (
    <>
      <SmoothScroll />
      {!isIsolatedPage && <InteractiveBackground />}
      {!isIsolatedPage && <CursorSpotlight />}
      <ScrollToTop />
      {!isIsolatedPage && <Banner />}
      {!isIsolatedPage && <Navbar onOpenAuth={onOpenAuth} onOpenRegistration={onOpenRegistration} />}
      {!isIsolatedPage && <MaintenanceBar />}
      
      <Routes>
        <Route path="/" element={<HomePage onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />} />
        <Route path="/learning" element={<LearningPage onOpenAuth={onOpenAuth} />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/blog" element={<BlogPage onGetInvolved={() => onOpenAuth('signup')} />} />
        <Route path="/blog/:blogId" element={<BlogPage onGetInvolved={() => onOpenAuth('signup')} />} />
        <Route path="/startups" element={<StartupsPage />} />
        <Route path="/about" element={<AboutPage onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<UserProfilePage onOpenAuth={onOpenAuth} />} />
        <Route path="/course/:id" element={<LearningPage />} />
        <Route path="/program/:id" element={<LearningPage />} />
        <Route path="/exam/:examId" element={<LearningPage />} />
        
        {/* Experience Route (isolated, lazy-loaded) */}
        <Route 
          path="/experience/*" 
          element={
            <Suspense fallback={
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                background: 'var(--color-charcoal-900, #181512)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
              }}>
                Loading Experience…
              </div>
            }>
              <ExperiencePage />
            </Suspense>
          } 
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>

      {!isIsolatedPage && <Footer />}
      {!isIsolatedPage && (
        <>
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            defaultTab={authDefaultTab}
          />
          <ContactUsModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
          />
          <RegistrationModal
            isOpen={isRegistrationOpen}
            onClose={() => setIsRegistrationOpen(false)}
          />
        </>
      )}
    </>
  );
};

import { ToastProvider } from './context/ToastContext';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState('login');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const handleOpenAuth = (tab = 'login') => {
    setAuthDefaultTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleOpenContact = () => {
    setIsContactModalOpen(true);
  };

  const handleOpenRegistration = () => {
    setIsRegistrationOpen(true);
  };


  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppLayout 
              onOpenAuth={handleOpenAuth} 
              isAuthModalOpen={isAuthModalOpen} 
              setIsAuthModalOpen={setIsAuthModalOpen} 
              authDefaultTab={authDefaultTab}
              onOpenContact={handleOpenContact}
              isContactModalOpen={isContactModalOpen}
              setIsContactModalOpen={setIsContactModalOpen}
              onOpenRegistration={handleOpenRegistration}
              isRegistrationOpen={isRegistrationOpen}
              setIsRegistrationOpen={setIsRegistrationOpen}
            />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
