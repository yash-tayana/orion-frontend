"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  TextField,
  Stack,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";
import { useStages } from "@/api/hooks/useStages";
import { useSettings } from "@/api/hooks/useSettings";
import { useMe } from "@/api/hooks/useMe";
import { isAdmin } from "@/utils/rbac";

const STATUS_LABELS = {
  SUSPECT: "Suspect",
  LEAD: "Lead",
  CANDIDATE_FREE: "Candidate-Free",
  CANDIDATE_PAID: "Candidate-Paid",
  ALUMNI: "Alumni",
  DEFERRED: "Deferred",
  DISCONTINUED: "Discontinued",
};

const STATUS_ORDER = [
  "SUSPECT",
  "LEAD",
  "CANDIDATE_FREE",
  "CANDIDATE_PAID",
  "ALUMNI",
  "DEFERRED",
  "DISCONTINUED",
];

interface StagesDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function StagesDialog({ open, onClose }: StagesDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { updateStages } = useStages();
  const { settings } = useSettings();
  const { data: me } = useMe();
  const [stages, setStages] = useState<{ [status: string]: string[] }>({});
  const [newStageNames, setNewStageNames] = useState<{
    [status: string]: string;
  }>({});

  // Initialize with stages from settings or defaults
  useEffect(() => {
    if (open) {
      if (settings.data?.stagesByStatus) {
        // Load from settings
        setStages(settings.data.stagesByStatus);
      } else {
        // Use defaults
        const defaultStages: { [status: string]: string[] } = {};
        STATUS_ORDER.forEach((status) => {
          defaultStages[status] = ["Initial Contact", "Follow-up", "Decision"];
        });
        setStages(defaultStages);
      }
      setNewStageNames({});
    }
  }, [open, settings.data]);

  const handleAddStage = (status: string) => {
    if (!isAdmin(me?.role)) return;
    const stageName = newStageNames[status]?.trim();
    if (!stageName) return;

    setStages((prev) => ({
      ...prev,
      [status]: [...(prev[status] || []), stageName],
    }));

    setNewStageNames((prev) => ({
      ...prev,
      [status]: "",
    }));
  };

  const handleRemoveStage = (status: string, stageName: string) => {
    if (!isAdmin(me?.role)) return;
    setStages((prev) => ({
      ...prev,
      [status]: (prev[status] || []).filter((stage) => stage !== stageName),
    }));
  };

  const handleSave = async () => {
    try {
      if (!isAdmin(me?.role)) {
        onClose();
        return;
      }
      // Transform to backend contract
      const payload = {
        stagesByStatus: stages,
      };

      // Log the exact payload for debugging
      console.log("Stages save payload:", JSON.stringify(payload, null, 2));

      await updateStages.mutateAsync(payload);
      enqueueSnackbar("Stages saved successfully", { variant: "success" });
      onClose();
    } catch (error: unknown) {
      let errorMessage = "Failed to save stages";

      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for 400 error (shape mismatch)
        if (error.message.includes("400") || error.message.includes("shape")) {
          errorMessage =
            "Stages must be arrays of strings per status. Please remove IDs/orders and try again.";
        }
      }

      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Manage Micro-Stages</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {STATUS_ORDER.map((status) => (
            <Accordion key={status} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Existing stages */}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(stages[status] || []).map((stageName) => (
                      <Chip
                        key={stageName}
                        label={stageName}
                        onDelete={
                          isAdmin(me?.role)
                            ? () => handleRemoveStage(status, stageName)
                            : undefined
                        }
                        deleteIcon={<DeleteIcon />}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>

                  {/* Add new stage */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      placeholder="Add new stage"
                      value={newStageNames[status] || ""}
                      onChange={(e) =>
                        setNewStageNames((prev) => ({
                          ...prev,
                          [status]: e.target.value,
                        }))
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddStage(status);
                        }
                      }}
                      sx={{ flex: 1 }}
                      disabled={!isAdmin(me?.role)}
                    />
                    <IconButton
                      onClick={() => handleAddStage(status)}
                      disabled={
                        !isAdmin(me?.role) || !newStageNames[status]?.trim()
                      }
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updateStages.isPending}
        >
          {updateStages.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
