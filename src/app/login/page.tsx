"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useAuth } from "@/auth/useAuth";
import { useRouter } from "next/navigation";
import { useMsal } from "@azure/msal-react";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolIcon from "@mui/icons-material/School";

import type { ReactElement } from "react";

export default function LoginPage(): ReactElement {
  const { isAuthenticated, signIn, inProgress, accessToken } = useAuth();
  const { instance } = useMsal();
  const router = useRouter();

  useEffect(() => {
    // Redirect if authenticated and have access token
    if (isAuthenticated && accessToken) {
      router.replace("/admin/learners");
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
      sx={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          animation: "float 6s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
            "50%": { transform: "translateY(-20px) rotate(180deg)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />

      {/* Main Login Container */}
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
            }}
          >
            <BusinessIcon sx={{ fontSize: 32, color: "white" }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "white",
              mb: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "1.1rem",
            }}
          >
            Sign in to access Orion Admin Console
          </Typography>
        </Paper>

        {/* Login Options Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 4,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Role Selection */}
          <Stack spacing={3} mb={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                background: "rgba(59, 130, 246, 0.1)",
                border: "2px solid rgba(59, 130, 246, 0.3)",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "rgba(59, 130, 246, 0.15)",
                  borderColor: "rgba(59, 130, 246, 0.5)",
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BusinessIcon sx={{ color: "white", fontSize: 20 }} />
                </Box>
                <Box flex={1}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "white", mb: 0.5 }}
                  >
                    Administrator Access
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.4 }}
                  >
                    Full system access • People management • Analytics •
                    Settings
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#3b82f6",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                  }}
                />
              </Stack>
            </Box>

            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                opacity: 0.6,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SchoolIcon
                    sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 20 }}
                  />
                </Box>
                <Box flex={1}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.5)",
                      mb: 0.5,
                    }}
                  >
                    Learner Portal
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.4)", lineHeight: 1.4 }}
                  >
                    Coming soon • Student access • Course management
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Sign In Button */}
          <Button
            size="large"
            variant="contained"
            onClick={handleSignIn}
            disabled={isLoading}
            startIcon={<MicrosoftIcon />}
            fullWidth
            sx={{
              py: 2.5,
              fontSize: "1.1rem",
              fontWeight: 700,
              borderRadius: 3,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              border: "none",
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.4)",
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                boxShadow: "0 12px 40px rgba(59, 130, 246, 0.6)",
                transform: "translateY(-2px)",
              },
              "&:active": {
                transform: "translateY(0px)",
              },
              "&:disabled": {
                background: "rgba(255, 255, 255, 0.1)",
                boxShadow: "none",
                transform: "none",
              },
              transition: "all 0.2s ease",
            }}
          >
            {isLoading ? "Connecting..." : "Continue with Microsoft"}
          </Button>

          {/* Security Info */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "rgba(34, 197, 94, 0.8)",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              🔒 Enterprise-grade security powered by Microsoft Azure AD
            </Typography>
          </Box>
        </Paper>

        {/* Footer */}
        <Box
          sx={{
            mt: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "0.75rem",
            }}
          >
            Orion Admin Console v1.0 • Secure • Reliable • Professional
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
