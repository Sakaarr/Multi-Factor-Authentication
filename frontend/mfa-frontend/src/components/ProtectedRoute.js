import { jwtDecode } from "jwt-decode";
import { Navigate, useLocation } from "react-router-dom";
import React from "react";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access");
  const location = useLocation();

  if (!token) {
    // Allow /mfa-login-verify to show without redirecting back
    if (location.pathname !== "/login" && location.pathname !== "/mfa-login-verify") {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      if (location.pathname !== "/login") {
        return <Navigate to="/login" replace />;
      }
      return children;
    }
  } catch {
    if (location.pathname !== "/login") {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // If logged in but on login page, go to dashboard
  if (location.pathname === "/login") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
