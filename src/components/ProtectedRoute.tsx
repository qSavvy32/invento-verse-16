
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Only update authorization status when loading is complete
    if (!loading) {
      setIsAuthorized(!!user);
    }
  }, [user, loading]);

  // Show loading state until we've determined authorization
  if (loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-invention-accent rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to auth page if not authorized
  if (!isAuthorized) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // User is authorized, render the protected route
  return <Outlet />;
};

export default ProtectedRoute;
