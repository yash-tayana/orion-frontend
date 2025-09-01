"use client";

import { ReactNode, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useAuth } from "./useAuth";
import { useRouter, usePathname } from "next/navigation";

import type { ReactElement } from "react";

export default function RequireAuth({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { isAuthenticated, accessToken, inProgress } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if not authenticated and not on login page
    if (pathname !== "/login" && !isAuthenticated && inProgress === "none") {
      router.push("/login");
    }
  }, [isAuthenticated, inProgress, router, pathname]);

  // If we're on the login page, don't do any auth checks
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!accessToken || !isAuthenticated || inProgress !== "none") {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
