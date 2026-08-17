import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FadeLoader } from "react-spinners";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.dispatchEvent(new Event("open-auth-popup"));
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-[60dvh]">
        <FadeLoader color="#ff385c" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
