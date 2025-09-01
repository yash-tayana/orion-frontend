"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, tokenRequest } from "./msalConfig";
import { jwtDecode } from "jwt-decode";

export type DecodedToken = {
  roles?: string[];
  iss?: string;
  aud?: string;
  [k: string]: unknown;
};

export function useAuth() {
  const { instance, inProgress, accounts } = useMsal();
  const account = useAccount(accounts[0] || null);
  const isAuthenticated = useIsAuthenticated();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  const acquireToken = useCallback(async (): Promise<string> => {
    const activeAccount = account || accounts[0] || null;
    if (!activeAccount) {
      const loginRes = await instance.loginPopup(loginRequest);
      const token = (
        await instance.acquireTokenSilent({
          ...tokenRequest,
          account: loginRes.account,
        })
      ).accessToken;
      return token;
    }
    const token = (
      await instance.acquireTokenSilent({
        ...tokenRequest,
        account: activeAccount,
      })
    ).accessToken;
    return token;
  }, [account, accounts, instance]);

  const signIn = useCallback(async () => {
    await instance.loginPopup(loginRequest);
  }, [instance]);

  const signOut = useCallback(async () => {
    await instance.logoutPopup();
  }, [instance]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await acquireToken();
        if (!mounted) return;
        setAccessToken(token);
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          setRoles(Array.isArray(decoded.roles) ? decoded.roles : []);
          if (process.env.NODE_ENV !== "production") {
            // Debug: verify v2 issuer and audience
            console.log("MSAL access token iss/aud:", decoded.iss, decoded.aud);
          }
        } catch {
          setRoles([]);
        }
      } catch {
        // ignore, will login on guard
      }
    })();
    return () => {
      mounted = false;
    };
  }, [acquireToken]);

  const role = useMemo(
    () => (roles.includes("ADMIN") ? "ADMIN" : "USER"),
    [roles]
  );

  return {
    accessToken,
    isAuthenticated,
    account,
    role,
    inProgress,
    signIn,
    signOut,
    acquireToken,
  } as const;
}

export default useAuth;
