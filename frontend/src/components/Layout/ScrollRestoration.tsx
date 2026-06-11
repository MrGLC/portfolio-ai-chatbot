import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets scroll on route change. Without this, navigating while scrolled
// lands mid-page on the new route, where whileInView sections never animate in.
export const ScrollRestoration: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
};
