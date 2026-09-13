
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "recruiter") {
      return (
        <Navigate
          to="/recruiter/dashboard"
          replace
        />
      );
    }

    if (user.role === "job-seeker") {
      return (
        <Navigate
          to="/job-seeker/dashboard"
          replace
        />
      );
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

