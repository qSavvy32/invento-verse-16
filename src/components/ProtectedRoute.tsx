
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const authCheckComplete = useRef(false);
  
  useEffect(() => {
    // Only update authorization status when loading is complete
    // and don't re-run authorization check unnecessarily
    if (!loading && !authCheckComplete.current) {
      console.log("Setting authorization status:", !!user);
      setIsAuthorized(!!user);
      authCheckComplete.current = true;
    }
    
    // Re-check authorization if user changes
    if (!loading && user !== null && !isAuthorized) {
      console.log("User authenticated, updating authorization");
      setIsAuthorized(true);
      authCheckComplete.current = true;
    } else if (!loading && user === null && isAuthorized) {
      console.log("User logged out, updating authorization");
      setIsAuthorized(false);
      authCheckComplete.current = true;
    }
  }, [user, loading, isAuthorized]);

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
