
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

const unprotectedRoutes = ["/", "/login", "/signup", "/password-reset"];
const dashboardRoutes = ["/dashboard", "/inbox", "/settings"];


export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isUnprotected = unprotectedRoutes.includes(pathname) || pathname.startsWith('/landing');
  const isDashboard = dashboardRoutes.includes(pathname)

  useEffect(() => {
    if (!loading && !user && isDashboard) {
      router.push("/login");
    }
     if (!loading && user && isUnprotected && pathname !== '/') {
      router.push("/dashboard");
    }
  }, [user, loading, router, isDashboard, isUnprotected, pathname]);

  if (loading) {
    // You can add a spinner here
    return null;
  }
  
  if (!user && isDashboard) {
      return null;
  }

  return <>{children}</>;
}
