"use client";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useMe } from "@/api/hooks/useMe";

import type { ReactElement } from "react";

export default function ProfilePage(): ReactElement {
  const { data, updateMe } = useMe();
  const { enqueueSnackbar } = useSnackbar();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (data) setDisplayName(data.displayName || "");
  }, [data]);

  return (
    <Paper sx={{ p: 2, maxWidth: 640 }}>
      <Stack spacing={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 56, height: 56 }}>
            {data?.displayName?.[0] || data?.email?.[0] || "?"}
          </Avatar>
          <Box>
            <Typography variant="h6">{data?.displayName || ""}</Typography>
            <Typography variant="body2" color="text.secondary">
              {data?.email}
            </Typography>
          </Box>
          <Box flexGrow={1} />
          {data?.role && <Chip label={data.role} color="primary" />}
        </Box>
        <TextField
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
        />
        <Typography variant="caption" color="text.secondary">
          Last login:{" "}
          {data?.lastLoginAt
            ? new Date(data.lastLoginAt).toLocaleString()
            : "-"}
        </Typography>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              await updateMe.mutateAsync({ displayName });
              enqueueSnackbar("Profile saved", { variant: "success" });
            } catch (e: unknown) {
              const errorMessage =
                e instanceof Error ? e.message : "Failed to save profile";
              enqueueSnackbar(errorMessage, {
                variant: "error",
              });
            }
          }}
        >
          Save
        </Button>
      </Stack>
    </Paper>
  );
}
