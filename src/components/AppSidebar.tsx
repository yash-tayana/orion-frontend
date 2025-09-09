"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import Image from "next/image";
import { isAdmin } from "@/utils/rbac";
import { useMe } from "@/api/hooks/useMe";

export default function AppSidebar({
  expanded = false,
  onItemClick,
}: {
  expanded?: boolean;
  onItemClick?: () => void;
}): ReactElement {
  const pathname = usePathname();
  const { data: me } = useMe();

  const items = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
    },
    { href: "/admin/learners", label: "Learners", icon: <PeopleAltIcon /> },
    { href: "/admin/roster", label: "Roster", icon: <AssignmentIcon /> },
    ...(isAdmin(me?.role)
      ? [{ href: "/admin/settings", label: "Settings", icon: <SettingsIcon /> }]
      : []),
    { href: "/admin/profile", label: "Profile", icon: <AccountCircleIcon /> },
  ];

  return (
    <List
      sx={{
        width: expanded ? 240 : 72,
        transition: "width 160ms ease",
        bgcolor: "#0F172A",
        height: "100vh",
        borderRight: "1px solid rgba(148,163,184,0.16)",
        overflowX: "hidden",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent={expanded ? "flex-start" : "center"}
        px={expanded ? 2 : 0}
        py={2}
      >
        {expanded ? (
          <Box sx={{ position: "relative", width: 360, height: 70 }}>
            <Image
              src="/TaLogo.png"
              alt="logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </Box>
        ) : (
          <Box sx={{ position: "relative", width: 60, height: 60 }}>
            <Image
              src="/ta-short.png"
              alt="logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </Box>
        )}
      </Box>
      {/* Section heading removed per request */}
      {items.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Tooltip
            key={item.href}
            title={!expanded ? item.label : ""}
            placement="right"
          >
            <ListItemButton
              component={Link}
              href={item.href}
              selected={active}
              sx={{
                my: 0.5,
                mx: 1,
                borderRadius: 0.8,
                bgcolor: active ? "rgba(109,110,246,0.08)" : "transparent",
                borderLeft: active
                  ? "2px solid rgba(109,110,246,0.6)"
                  : "2px solid transparent",
                color: active ? "primary.main" : "text.secondary",
                justifyContent: expanded ? "flex-start" : "center",
                transition:
                  "background-color 120ms ease, border-color 120ms ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)",
                },
                gap: expanded ? 1.75 : 0,
              }}
              onClick={onItemClick}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  color: active ? "#16A34A" : "#C7CFDA",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 700,
                    color: active ? "#16A34A" : "#E2E8F0",
                  }}
                  sx={{ m: 0 }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        );
      })}
    </List>
  );
}
