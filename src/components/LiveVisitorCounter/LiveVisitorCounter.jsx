import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPagePresence,
  logPageView
} from '../../services/visitorService';

/**
 * LiveVisitorCounter — Visual widget removed from user side across all pages.
 * Runs lightweight background page-view presence telemetry for admin analytics only.
 */
export default function LiveVisitorCounter() {
  const location = useLocation();

  // Track presence and log page view on every route change silently in background
  useEffect(() => {
    const path = location.pathname;
    trackPagePresence(path);
    logPageView(path);
  }, [location.pathname]);

  // Render nothing on the user side across all pages
  return null;
}
