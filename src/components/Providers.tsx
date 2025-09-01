"use client";

import { ReactNode, type ReactElement } from "react";
import {
  ThemeProvider,
  CssBaseline,
  StyledEngineProvider,
} from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { muiTheme } from "@/theme/muiTheme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import MsalProviderWrapper from "@/auth/MsalProviderWrapper";
import { SnackbarProvider } from "notistack";

export default function Providers({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const cache = createCache({ key: "mui", prepend: true });
  return (
    <MsalProviderWrapper>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={cache}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={muiTheme}>
              <CssBaseline />
              <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
                {children}
              </SnackbarProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </CacheProvider>
      </QueryClientProvider>
    </MsalProviderWrapper>
  );
}
