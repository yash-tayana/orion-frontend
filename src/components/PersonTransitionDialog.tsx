"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useTransitions } from "@/api/hooks/useTransitions";
import type { Person } from "@/api/hooks/usePeople";

interface PersonTransitionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // New callback for successful transitions
  person: Person;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  SUSPECT: ["LEAD"],
  LEAD: ["CANDIDATE_FREE"],
  CANDIDATE_FREE: ["CANDIDATE_PAID", "ALUMNI", "DEFERRED", "DISCONTINUED"],
  CANDIDATE_PAID: ["ALUMNI", "DEFERRED", "DISCONTINUED"],
  ALUMNI: ["DEFERRED"],
  DEFERRED: ["CANDIDATE_FREE", "CANDIDATE_PAID"],
  DISCONTINUED: ["CANDIDATE_FREE"],
};

const STATUS_LABELS: Record<string, string> = {
  SUSPECT: "Suspect",
  LEAD: "Lead",
  CANDIDATE_FREE: "Candidate (Free)",
  CANDIDATE_PAID: "Candidate (Paid)",
  ALUMNI: "Alumni",
  DEFERRED: "Deferred",
  DISCONTINUED: "Discontinued",
};

export default function PersonTransitionDialog({
  open,
  onClose,
  onSuccess,
  person,
}: PersonTransitionDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { transition } = useTransitions(person.id);
  const [formData, setFormData] = useState({
    toStatus: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableTransitions = ALLOWED_TRANSITIONS[person.status] || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.toStatus) {
      newErrors.toStatus = "Please select a new status";
    }
    if (!formData.reason?.trim()) {
      newErrors.reason = "Reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await transition.mutateAsync(formData);
      enqueueSnackbar("Status updated successfully", { variant: "success" });
      handleClose();
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update status";
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    }
  };

  const handleClose = () => {
    setFormData({
      toStatus: "",
      reason: "",
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (availableTransitions.length === 0) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>No Transitions Available</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <p>
              No status transitions are available from the current status:{" "}
              <strong>{STATUS_LABELS[person.status]}</strong>
            </p>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Person Status</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <Box>
            <p>
              <strong>Current Status:</strong> {STATUS_LABELS[person.status]}
            </p>
            <p>
              <strong>Person:</strong> {person.firstName} {person.lastName}
            </p>
          </Box>

          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select
              value={formData.toStatus}
              onChange={(e) => handleChange("toStatus", e.target.value)}
              label="New Status"
              error={!!errors.toStatus}
            >
              {availableTransitions.map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </MenuItem>
              ))}
            </Select>
            {errors.toStatus && (
              <FormHelperText error>{errors.toStatus}</FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Reason for Change"
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            error={!!errors.reason}
            helperText={
              errors.reason || "Explain why this status change is happening"
            }
            fullWidth
            multiline
            rows={3}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={transition.isPending}
        >
          {transition.isPending ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
