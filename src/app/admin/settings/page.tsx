"use client";

import { useMe } from "@/api/hooks/useMe";
import { useSettings } from "@/api/hooks/useSettings";
import CounselorDialog from "@/components/CounselorDialog";
import CounselorsTable from "@/components/CounselorsTable";
import { isAdmin } from "@/utils/rbac";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

import type { Counselor } from "@/api/hooks/useCounselors";
import StagesDialog from "@/components/StagesDialog";
import LabelIcon from "@mui/icons-material/Label";
import PersonIcon from "@mui/icons-material/Person";
import TimelineIcon from "@mui/icons-material/Timeline";
import { motion } from "framer-motion";
import type { ReactElement } from "react";

export default function SettingsPage(): ReactElement {
  const { settings, update } = useSettings();
  const { data: me } = useMe();
  const { enqueueSnackbar } = useSnackbar();
  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState("");
  const [openSources, setOpenSources] = useState(false);
  const [openStages, setOpenStages] = useState(false);
  const [openCounselors, setOpenCounselors] = useState(false);
  const [openCounselorDialog, setOpenCounselorDialog] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(
    null
  );

  useEffect(() => {
    if (settings.data) {
      setSources(settings.data.sources || []);
    }
  }, [settings.data]);

  const onSave = async () => {
    try {
      // Trim, de-dupe (case-insensitive), remove empty
      const cleanSources = Array.from(
        new Map(
          sources
            .map((s) => (s || "").trim())
            .filter((s) => s.length > 0)
            .map((s) => [s.toLowerCase(), s] as const)
        ).values()
      );

      const payload = { sources: cleanSources };

      await update.mutateAsync(payload as never);
      // Re-fetch to avoid optimistic masking
      await settings.refetch();
      enqueueSnackbar("Settings saved", { variant: "success" });
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number };
      enqueueSnackbar(err.message || "Failed to save settings", {
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

        {/* Counselors tile - visible to all signed-in users (view-only for non-admins) */}
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
              View and manage counseling providers
            </Typography>
          </Paper>
        </motion.div>
      </Box>

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

      {/* Counselors Dialog (view for all; CRUD gated by admin) */}
      <Dialog
        open={openCounselors}
        onClose={() => setOpenCounselors(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Counselors</DialogTitle>
        <DialogContent>
          <CounselorsTable
            onCreate={
              isAdmin(me?.role)
                ? () => {
                    setSelectedCounselor(null);
                    setOpenCounselorDialog(true);
                  }
                : undefined
            }
            onEdit={
              isAdmin(me?.role)
                ? (counselor) => {
                    setSelectedCounselor(counselor);
                    setOpenCounselorDialog(true);
                  }
                : undefined
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCounselors(false)}>Close</Button>
          {isAdmin(me?.role) && (
            <Button
              variant="contained"
              onClick={() => {
                setSelectedCounselor(null);
                setOpenCounselorDialog(true);
              }}
            >
              Add Counselor
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Counselor Create/Edit Dialog (admin only, guarded by open state) */}
      <CounselorDialog
        open={openCounselorDialog && isAdmin(me?.role)}
        onClose={() => {
          setOpenCounselorDialog(false);
          setSelectedCounselor(null);
        }}
        counselor={selectedCounselor}
      />
    </>
  );
}
