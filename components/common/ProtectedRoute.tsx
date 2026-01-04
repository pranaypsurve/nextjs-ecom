"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { ROUTE_PERMISSIONS, Role } from "@/lib/constants";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role | Role[];
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if route requires authentication
    const routePermission = ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS];
    
    if (routePermission || requiredRole) {
      const requiredRoles: Role[] = routePermission 
        ? [...routePermission] 
        : Array.isArray(requiredRole) 
          ? requiredRole 
          : [requiredRole!];
      
      if (!isAuthenticated || !user) {
        router.push("/login");
        return;
      }

      if (!requiredRoles.includes(user.role)) {
        // User doesn't have required role
        router.push("/");
        return;
      }
    }
  }, [pathname, isAuthenticated, user, router, requiredRole]);

  // Show children if user is authenticated and has required role
  const routePermission = ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS];
  const requiredRoles: Role[] = routePermission 
    ? [...routePermission] 
    : requiredRole 
      ? (Array.isArray(requiredRole) ? requiredRole : [requiredRole]) 
      : [];
  
  if (!isAuthenticated || !user) {
    return null;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
