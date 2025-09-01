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
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        aria-label="More options"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((it, i) => (
          <MenuItem
            key={i}
            onClick={(e) => {
              e.stopPropagation();
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
