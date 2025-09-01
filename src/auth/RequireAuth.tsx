"use client";

import { ReactNode, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useAuth } from "./useAuth";

import type { ReactElement } from "react";

export default function RequireAuth({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { isAuthenticated, accessToken, signIn, inProgress } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !inProgress) {
      void signIn();
    }
  }, [isAuthenticated, inProgress, signIn]);

  if (!accessToken) {
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
