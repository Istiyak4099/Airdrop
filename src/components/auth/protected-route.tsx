"use client";

import { ReactNode } from "react";

/**
 * Authentication is temporarily disabled for prototyping.
 * This component now simply renders its children without any redirection logic.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
