"use client";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useMe } from "@/api/hooks/useMe";

export default function ProfilePage(): JSX.Element {
  const { data, updateMe } = useMe();
  const { enqueueSnackbar } = useSnackbar();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (data) setDisplayName(data.displayName || "");
  }, [data]);

  return (
    <Paper sx={{ p: 2, maxWidth: 640 }}>
      <Stack spacing={2}>
        <TextField label="Email" value={data?.email || ""} disabled fullWidth />
        <TextField label="Role" value={data?.role || ""} disabled fullWidth />
        <TextField
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={async () => {
            try {
              await updateMe.mutateAsync({ displayName });
              enqueueSnackbar("Profile saved", { variant: "success" });
            } catch (e: any) {
              enqueueSnackbar(e?.message || "Failed to save profile", {
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
