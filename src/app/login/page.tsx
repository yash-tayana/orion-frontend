"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";
import { useRouter } from "next/navigation";

import type { ReactElement } from "react";

export default function LoginPage(): ReactElement {
  const { isAuthenticated, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/admin/people");
  }, [isAuthenticated, router]);

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
      <Button size="large" variant="contained" onClick={() => void signIn()}>
        Sign in with Microsoft
      </Button>
    </Box>
  );
}
