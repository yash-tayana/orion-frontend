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
    return new PublicClientApplication(msalConfig);
  }, []);
  return <MsalProvider instance={pca}>{children}</MsalProvider>;
}

export default MsalProviderWrapper;
