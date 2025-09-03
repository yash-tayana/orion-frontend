"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  useCounselors,
  type Counselor,
  type CreateCounselorPayload,
  type UpdateCounselorPayload,
} from "@/api/hooks/useCounselors";

interface CounselorDialogProps {
  open: boolean;
  onClose: () => void;
  counselor?: Counselor | null;
}

export default function CounselorDialog({
  open,
  onClose,
  counselor,
}: CounselorDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { create, update } = useCounselors();
  const [formData, setFormData] = useState({
    name: "",
    embedUrl: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEdit = Boolean(counselor);

  useEffect(() => {
    if (open) {
      if (counselor) {
        setFormData({
          name: counselor.name,
          embedUrl: counselor.embedUrl,
          isActive: counselor.isActive,
        });
      } else {
        setFormData({
          name: "",
          embedUrl: "",
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [open, counselor]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.embedUrl.trim()) {
      newErrors.embedUrl = "Embed URL is required";
    } else {
      // Basic URL validation
      try {
        new URL(formData.embedUrl);
      } catch {
        newErrors.embedUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEdit && counselor) {
        const payload: UpdateCounselorPayload = {
          name: formData.name.trim(),
          embedUrl: formData.embedUrl.trim(),
          isActive: formData.isActive,
        };
        await update.mutateAsync({ id: counselor.id, payload });
        enqueueSnackbar("Counselor updated successfully", {
          variant: "success",
        });
      } else {
        const payload: CreateCounselorPayload = {
          name: formData.name.trim(),
          embedUrl: formData.embedUrl.trim(),
          isActive: formData.isActive,
        };
        await create.mutateAsync(payload);
        enqueueSnackbar("Counselor created successfully", {
          variant: "success",
        });
      }
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${isEdit ? "update" : "create"} counselor`;
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Edit Counselor" : "Add New Counselor"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
          />

          <TextField
            label="Embed URL"
            value={formData.embedUrl}
            onChange={(e) => handleChange("embedUrl", e.target.value)}
            error={!!errors.embedUrl}
            helperText={
              errors.embedUrl || "Enter the full URL for the counseling embed"
            }
            fullWidth
            required
            multiline
            rows={2}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                color="primary"
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={create.isPending || update.isPending}
        >
          {create.isPending || update.isPending
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update"
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
