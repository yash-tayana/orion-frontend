"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import AppTopbar from "@/components/AppTopbar";
import RequireAuth from "@/auth/RequireAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const title = useMemo(() => {
    if (!pathname) return "";
    if (pathname.startsWith("/admin/people")) return "People";
    if (pathname.startsWith("/admin/roster")) return "Candidate-Free Roster";
    if (pathname.startsWith("/admin/settings")) return "Settings";
    if (pathname.startsWith("/admin/profile")) return "Profile";
    return "Admin";
  }, [pathname]);

  return (
    <RequireAuth>
      <Box display="flex">
        {isMdUp ? (
          <AppSidebar expanded={sidebarExpanded} />
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            PaperProps={{ sx: { width: 240, bgcolor: "#0E1426" } }}
          >
            <AppSidebar expanded onItemClick={() => setMobileOpen(false)} />
          </Drawer>
        )}
        <Box flex={1} ml={0} width="100%">
          <AppTopbar
            title={title}
            isSidebarExpanded={sidebarExpanded || !isMdUp}
            onToggleSidebar={() => {
              if (isMdUp) setSidebarExpanded((s) => !s);
              else setMobileOpen((s) => !s);
            }}
          />
          <Box px={{ xs: 2, sm: 3 }} py={3} maxWidth={1440} mx="auto">
            {children}
          </Box>
        </Box>
      </Box>
    </RequireAuth>
  );
}
