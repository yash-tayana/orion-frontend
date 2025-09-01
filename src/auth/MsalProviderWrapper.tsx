"use client";

import { ReactNode, useMemo } from "react";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msalConfig";

import type { ReactElement } from "react";

export function MsalProviderWrapper({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const pca = useMemo(() => {
    const redirectUri =
      typeof window !== "undefined" ? window.location.origin : undefined;
    return new PublicClientApplication({
      ...msalConfig,
      auth: {
        ...msalConfig.auth,
        redirectUri,
        postLogoutRedirectUri: redirectUri,
      },
    });
  }, []);
  return <MsalProvider instance={pca}>{children}</MsalProvider>;
}

export default MsalProviderWrapper;
