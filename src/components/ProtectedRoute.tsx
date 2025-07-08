import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AccessDenied from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  userRole?: string;
  requiredRole?: string | string[];
  requireExactRole?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  isAuthenticated, 
  userRole = 'unknown',
  requiredRole,
  requireExactRole = false
}) => {
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If no requiredRole is specified, only authentication is needed
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Role hierarchy: admin > eventmanager > parent > student
  const roleHierarchy = {
    admin: 4,
    eventmanager: 3,
    parent: 2,
    student: 1
  };

  const checkRoleAccess = (userRole: string, requiredRole: string | string[]): boolean => {
    // Normalize roles to lowercase for comparison
    const normalizedUserRole = userRole?.toLowerCase();
    
    console.log("ProtectedRoute - Role check:", {
      userRole,
      normalizedUserRole,
      requiredRole,
      requireExactRole
    });
    
    // If requiredRole is an array, check if user role is in the array
    if (Array.isArray(requiredRole)) {
      const hasAccess = requiredRole.some(role => role.toLowerCase() === normalizedUserRole);
      console.log("Array role check result:", hasAccess);
      return hasAccess;
    }

    const normalizedRequiredRole = requiredRole.toLowerCase();

    // If requireExactRole is true, check for exact match
    if (requireExactRole) {
      const hasAccess = normalizedUserRole === normalizedRequiredRole;
      console.log("Exact role check result:", hasAccess);
      return hasAccess;
    }

    // Otherwise, check role hierarchy (higher roles can access lower role pages)
    const userRoleLevel = roleHierarchy[normalizedUserRole as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[normalizedRequiredRole as keyof typeof roleHierarchy] || 0;
    
    const hasAccess = userRoleLevel >= requiredRoleLevel;
    console.log("Hierarchy role check:", {
      userRoleLevel,
      requiredRoleLevel,
      hasAccess
    });
    
    return hasAccess;
  };

  // Check role access
  if (!checkRoleAccess(userRole, requiredRole)) {
    const displayRequiredRole = Array.isArray(requiredRole) ? requiredRole[0] : requiredRole;
    return (
      <AccessDenied 
        userRole={userRole} 
        requiredRole={displayRequiredRole} 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
