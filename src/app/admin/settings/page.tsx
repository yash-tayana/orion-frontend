"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useSnackbar } from "notistack";
import { useSettings } from "@/api/hooks/useSettings";
import { useMe } from "@/api/hooks/useMe";
import { isAdmin } from "@/utils/rbac";

import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import PageHeader from "@/components/PageHeader";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import LabelIcon from "@mui/icons-material/Label";
import TimelineIcon from "@mui/icons-material/Timeline";
import PersonIcon from "@mui/icons-material/Person";
import { motion } from "framer-motion";
import StagesDialog from "@/components/StagesDialog";
import CounselorsTable from "@/components/CounselorsTable";
import CounselorDialog from "@/components/CounselorDialog";
import type { ReactElement } from "react";
import type { Counselor } from "@/api/hooks/useCounselors";

export default function SettingsPage(): ReactElement {
  const { settings, update } = useSettings();
  const { data: me } = useMe();
  const { enqueueSnackbar } = useSnackbar();
  const [meetingLink, setMeetingLink] = useState("");
  const [counselingEmbedUrl, setCounselingEmbedUrl] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState("");
  const [openMeeting, setOpenMeeting] = useState(false);
  const [openSources, setOpenSources] = useState(false);
  const [openStages, setOpenStages] = useState(false);
  const [openCounselors, setOpenCounselors] = useState(false);
  const [openCounselorDialog, setOpenCounselorDialog] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(
    null
  );

  useEffect(() => {
    if (settings.data) {
      setMeetingLink(settings.data.meetingLink || "");
      setCounselingEmbedUrl(settings.data.counselingEmbedUrl || "");
      setSources(settings.data.sources || []);
    }
  }, [settings.data]);

  const onSave = async () => {
    try {
      // Filter out empty sources and trim whitespace
      const cleanSources = sources
        .filter((s) => s && typeof s === "string" && s.trim() !== "")
        .map((s) => s.trim());

      // Ensure all values are properly formatted
      const payload: Record<string, unknown> = {};

      if (meetingLink.trim()) {
        payload.meetingLink = meetingLink.trim();
      }

      if (counselingEmbedUrl.trim()) {
        payload.counselingEmbedUrl = counselingEmbedUrl.trim();
      }

      if (cleanSources.length > 0) {
        payload.sources = cleanSources;
      }

      await update.mutateAsync(payload);
      enqueueSnackbar("Settings saved", { variant: "success" });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to save settings";
      enqueueSnackbar(message, {
        variant: "error",
      });
    }
  };

  return (
    <>
      <PageHeader title="Settings" />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Paper
            sx={{
              p: 2.5,
              border: "1px solid rgba(148,163,184,0.12)",
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() => setOpenMeeting(true)}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <VideoCallIcon color="primary" />
              <Typography variant="h6">Counseling & Meeting</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Configure meeting link and counseling embed URL
            </Typography>
          </Paper>
        </motion.div>
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Paper
            sx={{
              p: 2.5,
              border: "1px solid rgba(148,163,184,0.12)",
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() => setOpenSources(true)}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LabelIcon color="primary" />
              <Typography variant="h6">Sources</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Manage source tags used in Learners
            </Typography>
          </Paper>
        </motion.div>

        {/* Stages tile - Admin only */}
        {isAdmin(me?.role) && (
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Paper
              sx={{
                p: 2.5,
                border: "1px solid rgba(148,163,184,0.12)",
                borderRadius: 2,
                cursor: "pointer",
              }}
              onClick={() => setOpenStages(true)}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TimelineIcon color="primary" />
                <Typography variant="h6">Stages</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Manage micro-stages for each status
              </Typography>
            </Paper>
          </motion.div>
        )}

        {/* Counselors tile - Admin only */}
        {isAdmin(me?.role) && (
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Paper
              sx={{
                p: 2.5,
                border: "1px solid rgba(148,163,184,0.12)",
                borderRadius: 2,
                cursor: "pointer",
              }}
              onClick={() => setOpenCounselors(true)}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <PersonIcon color="primary" />
                <Typography variant="h6">Counselors</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Manage counseling providers and embed URLs
              </Typography>
            </Paper>
          </motion.div>
        )}
      </Box>

      <Dialog
        open={openMeeting}
        onClose={() => setOpenMeeting(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Counseling & Meeting</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMeeting(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await onSave();
              setOpenMeeting(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openSources}
        onClose={() => setOpenSources(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Sources</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              label="Add Source"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              fullWidth
            />
            <Button
              onClick={() => {
                if (!newSource.trim()) return;
                const trimmedSource = newSource.trim();
                setSources((s) => Array.from(new Set([...s, trimmedSource])));
                setNewSource("");
              }}
              disabled={!newSource.trim()}
            >
              Add
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {sources.map((s) => (
              <Chip
                key={s}
                label={s}
                onDelete={() =>
                  setSources((curr) => curr.filter((x) => x !== s))
                }
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSources(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await onSave();
              setOpenSources(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stages Dialog */}
      <StagesDialog open={openStages} onClose={() => setOpenStages(false)} />

      {/* Counselors Dialog */}
      <Dialog
        open={openCounselors}
        onClose={() => setOpenCounselors(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Counselors Management</DialogTitle>
        <DialogContent>
          <CounselorsTable
            onCreate={() => {
              setSelectedCounselor(null);
              setOpenCounselorDialog(true);
            }}
            onEdit={(counselor) => {
              setSelectedCounselor(counselor);
              setOpenCounselorDialog(true);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCounselors(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Counselor Create/Edit Dialog */}
      <CounselorDialog
        open={openCounselorDialog}
        onClose={() => {
          setOpenCounselorDialog(false);
          setSelectedCounselor(null);
        }}
        counselor={selectedCounselor}
      />
    </>
  );
}
