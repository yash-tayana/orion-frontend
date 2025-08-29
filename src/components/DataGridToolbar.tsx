"use client";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

export default function DataGridToolbar({
  q,
  status,
  onQ,
  onStatus,
  onCreate,
  disableCreate,
}: {
  q: string;
  status: string;
  onQ: (v: string) => void;
  onStatus: (v: string) => void;
  onCreate: () => void;
  disableCreate?: boolean;
}): JSX.Element {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1 }}>
      <TextField
        size="small"
        label="Search"
        value={q}
        onChange={(e) => onQ(e.target.value)}
      />
      <TextField
        select
        size="small"
        label="Status"
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        sx={{ minWidth: 180 }}
      >
        {[
          "",
          "SUSPECT",
          "LEAD",
          "CANDIDATE_FREE",
          "CANDIDATE_PAID",
          "ALUMNI",
          "DEFERRED",
          "DISCONTINUED",
        ].map((s) => (
          <MenuItem key={s} value={s}>
            {s || "All"}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" onClick={onCreate} disabled={disableCreate}>
        New Person
      </Button>
    </Stack>
  );
}
