import type { ReactElement } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  subtext,
  icon,
  onClick,
  clickable = false,
}: {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}): ReactElement {
  const content = (
    <Box display="flex" alignItems="center" gap={2}>
      {icon && <Box>{icon}</Box>}
      <Box>
        <Typography variant="h3" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h2">{value}</Typography>
        {subtext && (
          <Typography variant="body2" color="text.secondary">
            {subtext}
          </Typography>
        )}
      </Box>
    </Box>
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (clickable && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Paper
        sx={{
          p: 2.5,
          cursor: clickable ? "pointer" : "default",
          "&:hover": clickable
            ? {
                bgcolor: "rgba(148,163,184,0.05)",
              }
            : {},
          "&:focus": clickable
            ? {
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
              }
            : {},
        }}
        onClick={clickable ? onClick : undefined}
        onKeyDown={clickable ? handleKeyDown : undefined}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? "button" : undefined}
      >
        {content}
      </Paper>
    </motion.div>
  );
}
