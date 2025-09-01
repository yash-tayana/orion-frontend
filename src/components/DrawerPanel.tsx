"use client";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactElement } from "react";

export default function DrawerPanel({
  open,
  title,
  onClose,
  headerActions,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}): ReactElement {
  const prefersReduced = useReducedMotion();
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <motion.div
        initial={prefersReduced ? false : { x: 40, opacity: 0 }}
        animate={prefersReduced ? false : { x: 0, opacity: 1 }}
        transition={{ duration: prefersReduced ? 0 : 0.15 }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={2}
          py={1.5}
          position="sticky"
          top={0}
          bgcolor="background.paper"
          zIndex={1}
          borderBottom="1px solid"
          borderColor="divider"
        >
          <Typography variant="h2">{title}</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {headerActions}
            <IconButton onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Box px={2} py={2}>
          {children}
        </Box>
      </motion.div>
    </Drawer>
  );
}
