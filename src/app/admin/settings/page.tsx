"use client";

import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useSnackbar } from "notistack";
import { useSettings } from "@/api/hooks/useSettings";

export default function SettingsPage(): JSX.Element {
  const { settings, update } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [meetingLink, setMeetingLink] = useState("");
  const [counselingEmbedUrl, setCounselingEmbedUrl] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState("");

  useEffect(() => {
    if (settings.data) {
      setMeetingLink(settings.data.meetingLink || "");
      setCounselingEmbedUrl(settings.data.counselingEmbedUrl || "");
      setSources(settings.data.sources || []);
    }
  }, [settings.data]);

  const onSave = async () => {
    try {
      await update.mutateAsync({ meetingLink, counselingEmbedUrl, sources });
      enqueueSnackbar("Settings saved", { variant: "success" });
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Failed to save settings", {
        variant: "error",
      });
    }
  };

  return (
    <Paper sx={{ p: 2, maxWidth: 720 }}>
      <Stack spacing={2}>
        <TextField
          label="Default Meeting Link"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          fullWidth
        />
        <TextField
          label="Counseling Embed URL"
          value={counselingEmbedUrl}
          onChange={(e) => setCounselingEmbedUrl(e.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            label="Add Source"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!newSource) return;
              setSources((s) => Array.from(new Set([...s, newSource])));
              setNewSource("");
            }}
          >
            Add
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {sources.map((s) => (
            <Chip
              key={s}
              label={s}
              onDelete={() => setSources((curr) => curr.filter((x) => x !== s))}
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button onClick={onSave} variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
