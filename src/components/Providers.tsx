"use client";

import { JSX, ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { muiTheme } from "@/theme/muiTheme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import MsalProviderWrapper from "@/auth/MsalProviderWrapper";
import { SnackbarProvider } from "notistack";

export default function Providers({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <MsalProviderWrapper>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
            {children}
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </MsalProviderWrapper>
  );
}
