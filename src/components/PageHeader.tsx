import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import type { ReactElement } from "react";

export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}): ReactElement {
  return (
    <Box mb={2}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography variant="h1">{title}</Typography>
          {description && (
            <Typography variant="body1" color="text.secondary" mt={0.5}>
              {description}
            </Typography>
          )}
        </Box>
        {actions}
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}
