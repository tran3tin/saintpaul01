import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';

/**
 * Public route wrapper - redirects authenticated users to dashboard
 */
const PublicRoute = ({ children, restricted = false }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return <Loading fullScreen />;
  }

  // If route is restricted (e.g., login page) and user is authenticated,
  // redirect to the page they came from or dashboard
  if (restricted && isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;
