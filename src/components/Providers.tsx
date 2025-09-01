"use client";

import { ReactNode, type ReactElement, useState, useEffect } from "react";
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
import MsalRedirectHandler from "./MsalRedirectHandler";

export default function Providers({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const cache = createCache({ key: "mui", prepend: true });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <MsalProviderWrapper>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={cache}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={muiTheme}>
              <CssBaseline />
              <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {isClient && <MsalRedirectHandler />}
                {children}
              </SnackbarProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </CacheProvider>
      </QueryClientProvider>
    </MsalProviderWrapper>
  );
}
