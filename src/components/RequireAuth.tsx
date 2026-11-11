import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AUTH_EXPIRED_EVENT, getAuthToken } from "@/services/apiClient";

/**
 * Route guard: only signed-in users (valid bearer token) can open the wrapped pages.
 * If the server later rejects the token, the user is sent back to the sign-in screen.
 */
const RequireAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onExpired = () => {
      toast.error("Your session has expired. Please sign in again.");
      navigate("/signin", { replace: true });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [navigate]);

  if (!getAuthToken()) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
