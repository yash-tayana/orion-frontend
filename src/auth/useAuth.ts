"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, tokenRequest, logoutRequest } from "./msalConfig";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const acquireToken = useCallback(async (): Promise<string | null> => {
    const activeAccount = account || accounts[0] || null;
    if (!activeAccount) {
      // If no account, return null instead of redirecting
      return null;
    }
    try {
      const token = (
        await instance.acquireTokenSilent({
          ...tokenRequest,
          account: activeAccount,
        })
      ).accessToken;
      return token;
    } catch {
      return null;
    }
  }, [account, accounts, instance]);

  const signIn = useCallback(async () => {
    await instance.loginRedirect(loginRequest);
  }, [instance]);

  const signOut = useCallback(async () => {
    const activeAccount = account || accounts[0] || null;
    if (activeAccount) {
      // Clear all cache and redirect to logout
      await instance.logoutRedirect({
        ...logoutRequest,
        account: activeAccount,
      });
    } else {
      // If no account, just redirect to login page
      router.push("/login");
    }
  }, [instance, account, accounts, router]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await acquireToken();
        if (!mounted) return;
        setAccessToken(token);
        if (token) {
          try {
            const decoded = jwtDecode<DecodedToken>(token);
            setRoles(Array.isArray(decoded.roles) ? decoded.roles : []);
            // Token decoded successfully
          } catch {
            setRoles([]);
          }
        } else {
          setRoles([]);
        }
      } catch {
        // For errors, clear state
        if (mounted) {
          setAccessToken(null);
          setRoles([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [acquireToken]);

  // Additional effect to handle account changes
  useEffect(() => {
    if (account && !accessToken) {
      // If we have an account but no token, try to acquire one
      acquireToken().then((token) => {
        if (token) {
          setAccessToken(token);
        }
      });
    }
  }, [account, accessToken, acquireToken]);

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
