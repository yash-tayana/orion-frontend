"use client";

import type { ReactElement } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import MenuIcon from "@mui/icons-material/Menu";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/useAuth";

export default function AppTopbar({
  title,
  onToggleSidebar,
  isSidebarExpanded,
}: {
  title?: string;
  onToggleSidebar?: () => void;
  isSidebarExpanded?: boolean;
}): ReactElement {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { signOut } = useAuth();
  const router = useRouter();

  const open = Boolean(anchorEl);
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.88))",
        borderBottom: "1px solid rgba(148,163,184,0.18)",
      }}
    >
      <Toolbar sx={{ minHeight: 64, gap: 1 }}>
        <IconButton
          onClick={onToggleSidebar}
          size="large"
          sx={{ mr: 1 }}
          aria-label="Toggle sidebar"
        >
          {isSidebarExpanded ? <KeyboardDoubleArrowLeftIcon /> : <MenuIcon />}
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title || "Orion Admin"}
        </Typography>
        {/* Theme toggle removed per request */}
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="large"
          aria-label="Account"
        >
          <AccountCircle />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              router.push("/admin/profile");
            }}
          >
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              void signOut();
            }}
          >
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
