import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever the route pathname or search parameters change,
 * the window is immediately scrolled to the top of the newly navigated page.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
