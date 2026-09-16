import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { LanguageProvider } from './hooks/useLanguage';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './context/ToastContext';
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
import ContactPage from './pages/user/ContactPage';
import ResetPasswordPage from './pages/user/ResetPasswordPage';
import NotFoundPage from './pages/user/NotFoundPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import BackendStatusBanner from './components/BackendStatusBanner/BackendStatusBanner';
import UserProfilePage from './pages/user/UserProfilePage';
import CourseDetailPage from './pages/user/CourseDetailPage';
import ExamDetailPage from './pages/user/ExamDetailPage';
import ScrollToTop from './components/ScrollToTop';
import AuthModal from './components/AuthModal/AuthModal';
import ContactUsModal from './components/ContactUsModal/ContactUsModal';
import InteractiveBackground from './components/InteractiveBackground';
import SmoothScroll from './components/SmoothScroll';
import RegistrationModal from './components/RegistrationModal/RegistrationModal';
import MouseEffects from './components/MouseEffects/MouseEffects';
import LiveVisitorCounter from './components/LiveVisitorCounter/LiveVisitorCounter';

import PublicSubmissionPage from './pages/public/PublicSubmissionPage';

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
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const redirect = sessionStorage.getItem('spa_redirect');
      if (redirect) {
        sessionStorage.removeItem('spa_redirect');
        if (location.pathname !== redirect) {
          navigate(redirect, { replace: true });
        }
      }
    } catch (e) {}
  }, [navigate, location.pathname]);

  const isAdminPage = location.pathname.startsWith('/admin');
  const isExperiencePage = location.pathname.startsWith('/experience');
  const isResetPasswordPage = location.pathname.startsWith('/reset-password');
  const isSubmissionPage = location.pathname.startsWith('/submission');
  const isIsolatedPage = isAdminPage || isExperiencePage || isResetPasswordPage || isSubmissionPage;

  return (
    <>
      <SmoothScroll />
      {!isIsolatedPage && <InteractiveBackground />}
      {!isIsolatedPage && <MouseEffects isGlobal={true} color="#C1552C" interactionMode="burst" duration={0.4} effectSize={80} />}
      <ScrollToTop />
      <BackendStatusBanner />
      {!isIsolatedPage && <Banner />}
      {!isIsolatedPage && <Navbar onOpenAuth={onOpenAuth} onOpenRegistration={onOpenRegistration} />}
      {!isIsolatedPage && <MaintenanceBar />}
      
      <main id="main-content" className="app-main-content" role="main">
        <Routes>
          <Route path="/" element={<HomePage onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />} />
        <Route path="/learning" element={<LearningPage onOpenAuth={onOpenAuth} />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/blog" element={<BlogPage onGetInvolved={() => onOpenAuth('signup')} />} />
        <Route path="/blog/:blogId" element={<BlogPage onGetInvolved={() => onOpenAuth('signup')} />} />
        <Route path="/startups" element={<StartupsPage onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />} />
        <Route path="/about" element={<AboutPage onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />} />
        <Route path="/contact" element={<ContactPage onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />} />
        <Route path="/privacy" element={<PolicyPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route 
          path="/profile" 
          element={
            <UserProtectedRoute onOpenAuth={onOpenAuth}>
              <UserProfilePage onOpenAuth={onOpenAuth} onOpenRegistration={onOpenRegistration} onOpenContact={onOpenContact} />
            </UserProtectedRoute>
          } 
        />
        <Route path="/course/:id" element={<CourseDetailPage onGetInvolved={() => onOpenAuth('signup')} />} />
        <Route path="/courses/:id" element={<CourseDetailPage onGetInvolved={() => onOpenAuth('signup')} />} />
        <Route path="/program/:id" element={<CourseDetailPage onGetInvolved={() => onOpenAuth('signup')} />} />
        <Route path="/exam/:examId" element={<ExamDetailPage onGetInvolved={() => onOpenAuth('signup')} />} />
        <Route path="/exam/:id" element={<ExamDetailPage onGetInvolved={() => onOpenAuth('signup')} />} />
        
        {/* Public Submission Details Verification Route */}
        <Route path="/submission" element={<PublicSubmissionPage />} />
        <Route path="/submission/:id" element={<PublicSubmissionPage />} />
        
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
                backgroundColor: '#FBF8F3',
                backgroundImage: 'radial-gradient(rgba(24, 21, 18, 0.12) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#181512',
                zIndex: 99999,
                padding: '1.25rem',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  background: '#FFFFFF',
                  border: '2.5px solid #181512',
                  borderRadius: '2px',
                  boxShadow: '6px 6px 0px #181512',
                  maxWidth: '380px',
                  width: '100%',
                  overflow: 'hidden',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    background: '#181512',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                      <span>SYS.EXP // 3D_SPATIAL</span>
                    </div>
                    <span style={{ opacity: 0.85 }}>[ ❖ ]</span>
                  </div>
                  <div style={{ padding: '20px 20px 16px' }}>
                    <div style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#181512',
                      marginBottom: '10px'
                    }}>
                      Bihar AI Mission
                    </div>
                    <div style={{
                      border: '2px solid #181512',
                      background: '#F4EFE6',
                      height: '14px',
                      borderRadius: '2px',
                      padding: '2px',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '1px',
                        background: 'repeating-linear-gradient(-45deg, #C1552C 0px, #C1552C 8px, #872E0C 8px, #872E0C 16px)',
                        width: '85%'
                      }} />
                    </div>
                    <div style={{
                      fontFamily: "'Fira Code', 'Courier New', monospace",
                      fontSize: '10px',
                      color: '#5E554D',
                      fontWeight: 700,
                      letterSpacing: '0.06em'
                    }}>
                      &gt; INITIALIZING SPATIAL ENVIRONMENT...
                    </div>
                  </div>
                </div>
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

        {/* Catch-all 404 Not Found Route */}
        <Route path="*" element={<NotFoundPage onOpenAuth={onOpenAuth} onOpenRegistration={onOpenRegistration} />} />
      </Routes>
    </main>

      {!isIsolatedPage && <LiveVisitorCounter />}
      {!isIsolatedPage && <Footer />}
      {!isIsolatedPage && (
        <>
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            defaultTab={authDefaultTab}
            onOpenRegistration={onOpenRegistration}
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

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState('login');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const handleOpenAuth = useCallback((tab = 'login') => {
    setAuthDefaultTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const handleOpenContact = useCallback(() => {
    setIsContactModalOpen(true);
  }, []);

  const handleOpenRegistration = useCallback(() => {
    setIsRegistrationOpen(true);
  }, []);

  useEffect(() => {
    const handleGlobalContact = () => setIsContactModalOpen(true);
    window.addEventListener('bihar_ai_open_contact_modal', handleGlobalContact);
    return () => window.removeEventListener('bihar_ai_open_contact_modal', handleGlobalContact);
  }, []);


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
