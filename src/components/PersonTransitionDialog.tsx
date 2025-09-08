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
  Stack,
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
    deferredUntil: null as Date | null,
    deferredReason: "",
    discontinueReason: "",
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

    // Additional validation for DEFERRED status
    if (formData.toStatus === "DEFERRED") {
      if (!formData.deferredUntil) {
        newErrors.deferredUntil = "Deferral date is required";
      }
      if (!formData.deferredReason?.trim()) {
        newErrors.deferredReason = "Deferral reason is required";
      }
    }

    // Additional validation for DISCONTINUED status
    if (formData.toStatus === "DISCONTINUED") {
      if (!formData.discontinueReason?.trim()) {
        newErrors.discontinueReason = "Discontinuation reason is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Prepare payload based on status type
      const payload: {
        toStatus: string;
        reason: string;
        deferredUntil?: string | null;
        deferredReason?: string;
        discontinueReason?: string;
      } = {
        toStatus: formData.toStatus,
        reason: formData.reason,
      };

      if (formData.toStatus === "DEFERRED") {
        payload.deferredUntil = formData.deferredUntil?.toISOString() || null;
        payload.deferredReason = formData.deferredReason;
      }

      if (formData.toStatus === "DISCONTINUED") {
        payload.discontinueReason = formData.discontinueReason;
      }

      await transition.mutateAsync(payload);
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
      deferredUntil: null,
      deferredReason: "",
      discontinueReason: "",
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: string, value: string | Date | null) => {
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
      <DialogTitle>Update Learner Status</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <Box>
            <p>
              <strong>Current Status:</strong> {STATUS_LABELS[person.status]}
            </p>
            <p>
              <strong>Learner:</strong> {person.firstName} {person.lastName}
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

          {/* Conditional fields for DEFERRED status */}
          {formData.toStatus === "DEFERRED" && (
            <Stack spacing={2}>
              <TextField
                label="Deferral Date"
                type="date"
                value={
                  formData.deferredUntil
                    ? formData.deferredUntil.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  handleChange("deferredUntil", date);
                }}
                error={!!errors.deferredUntil}
                helperText={
                  errors.deferredUntil ||
                  "When should this learner be reconsidered?"
                }
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Deferral Reason"
                value={formData.deferredReason}
                onChange={(e) => handleChange("deferredReason", e.target.value)}
                error={!!errors.deferredReason}
                helperText={
                  errors.deferredReason || "Why is this learner being deferred?"
                }
                fullWidth
                multiline
                rows={2}
                required
              />
            </Stack>
          )}

          {/* Conditional fields for DISCONTINUED status */}
          {formData.toStatus === "DISCONTINUED" && (
            <TextField
              label="Discontinuation Reason"
              value={formData.discontinueReason}
              onChange={(e) =>
                handleChange("discontinueReason", e.target.value)
              }
              error={!!errors.discontinueReason}
              helperText={
                errors.discontinueReason ||
                "Why is this learner being discontinued?"
              }
              fullWidth
              multiline
              rows={2}
              required
            />
          )}
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
