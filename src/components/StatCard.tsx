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
}: {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
}): ReactElement {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Paper sx={{ p: 2.5 }}>
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
      </Paper>
    </motion.div>
  );
}
