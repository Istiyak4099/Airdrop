"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

const unprotectedRoutes = ["/landing", "/login", "/signup", "/password-reset"];

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isUnprotected = unprotectedRoutes.includes(pathname) || pathname === '/';


  useEffect(() => {
    if (!loading && !user && !isUnprotected) {
      router.push("/login");
    }
  }, [user, loading, router, isUnprotected]);

  if (loading) {
    // You can add a spinner here
    return null;
  }
  
  if (!user && !isUnprotected) {
      return null;
  }

  return <>{children}</>;
}
