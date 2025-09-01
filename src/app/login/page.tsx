"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";
import { useRouter } from "next/navigation";
import { useMsal } from "@azure/msal-react";

import type { ReactElement } from "react";

export default function LoginPage(): ReactElement {
  const { isAuthenticated, signIn, inProgress, accessToken } = useAuth();
  const { instance } = useMsal();
  const router = useRouter();

  useEffect(() => {
    // Redirect if authenticated and have access token
    if (isAuthenticated && accessToken) {
      router.replace("/admin/people");
    }
  }, [isAuthenticated, accessToken, router]);

  // Additional effect to check for existing accounts
  useEffect(() => {
    const checkExistingAccounts = async () => {
      try {
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          // Try to acquire token silently
          try {
            const token = await instance.acquireTokenSilent({
              scopes: ["openid", "profile"],
              account: accounts[0],
            });
            if (token.accessToken) {
              router.push("/admin/people");
            }
          } catch (error) {
            // Silent token acquisition failed
          }
        }
      } catch (error) {
        // Error checking accounts
      }
    };

    // Small delay to ensure MSAL is ready
    setTimeout(checkExistingAccounts, 1000);
  }, [instance, router]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      // Sign in error
    }
  };

  const isLoading = inProgress !== "none";

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      flexDirection="column"
      gap={3}
    >
      <Typography variant="h4">Sign in</Typography>
      <Tabs value={0} aria-label="login tabs">
        <Tab label="Admin" />
        <Tab label="Learner (coming soon)" disabled />
      </Tabs>
      <Button
        size="large"
        variant="contained"
        onClick={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in with Microsoft"}
      </Button>
    </Box>
  );
}
