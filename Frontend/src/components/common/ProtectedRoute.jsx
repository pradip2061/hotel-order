import React from "react";
import { Navigate } from "react-router-dom";

// roles: array of allowed roles for this route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user")); // or from your auth context

  if (!user) {
    // not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // logged in but not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children; // allowed, render page
};

export default ProtectedRoute;
