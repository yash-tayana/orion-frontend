"use client";

import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useRouter, usePathname } from "next/navigation";

export default function MsalRedirectHandler() {
  const { instance } = useMsal();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure this only runs on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient) return;

    // Wait for MSAL to be properly initialized
    const checkInitialization = async () => {
      try {
        // Check if MSAL is ready by trying to get all accounts
        instance.getAllAccounts();
        setIsInitialized(true);
      } catch {
        // MSAL not ready yet, wait a bit and try again
        setTimeout(checkInitialization, 100);
      }
    };

    void checkInitialization();
  }, [instance, isClient]);

  useEffect(() => {
    // Only handle redirect after MSAL is initialized and on client side
    if (!isInitialized || !isClient) return;

    // Handle redirect response from Microsoft
    const handleRedirectResponse = async () => {
      try {
        // Always try to handle redirect promise, regardless of current accounts
        const response = await instance.handleRedirectPromise();
        if (response) {
          // Successfully handled redirect, user is now authenticated
          // Redirect to admin people page
          router.push("/admin/people");
        }
      } catch (error) {
        // Don't redirect on error to prevent loops
      }
    };

    // Handle redirect response on every page load
    void handleRedirectResponse();
  }, [instance, router, isInitialized, isClient]);

  // Additional effect to handle redirect when pathname changes
  useEffect(() => {
    if (!isInitialized || !isClient) return;

    // If we're on the login page, try to handle redirect again
    if (pathname === "/login") {
      const handleRedirectOnLoginPage = async () => {
        try {
          const response = await instance.handleRedirectPromise();
          if (response) {
            router.push("/admin/people");
          }
        } catch (error) {
          // Error handling redirect on login page
        }
      };

      // Small delay to ensure MSAL is ready
      setTimeout(handleRedirectOnLoginPage, 500);
    }
  }, [pathname, instance, router, isInitialized, isClient]);

  // Return null during SSR to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return null; // This component doesn't render anything
}
