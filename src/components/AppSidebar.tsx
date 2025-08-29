"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { isAdmin } from "@/utils/rbac";
import { useMe } from "@/api/hooks/useMe";

export default function AppSidebar(): JSX.Element {
  const pathname = usePathname();
  const { data: me } = useMe();

  const items = [
    { href: "/admin/people", label: "People", icon: <PeopleAltIcon /> },
    { href: "/admin/roster", label: "Roster", icon: <AssignmentIcon /> },
    ...(isAdmin(me?.role)
      ? [{ href: "/admin/settings", label: "Settings", icon: <SettingsIcon /> }]
      : []),
    { href: "/admin/profile", label: "Profile", icon: <AccountCircleIcon /> },
  ];

  return (
    <List>
      {items.map((item) => (
        <ListItemButton
          key={item.href}
          component={Link}
          href={item.href}
          selected={pathname?.startsWith(item.href)}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );
}
