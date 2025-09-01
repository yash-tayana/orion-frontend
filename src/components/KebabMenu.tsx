"use client";

import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import type { ReactElement } from "react";

export default function KebabMenu({
  items,
}: {
  items: { label: string; onClick: () => void; disabled?: boolean }[];
}): ReactElement {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {items.map((it, i) => (
          <MenuItem
            key={i}
            onClick={() => {
              setAnchorEl(null);
              it.onClick();
            }}
            disabled={it.disabled}
          >
            {it.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
