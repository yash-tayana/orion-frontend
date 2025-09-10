"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { usePeople, type CreatePersonRequest } from "@/api/hooks/usePeople";
import { useSettings } from "@/api/hooks/useSettings";
import type { ReactElement } from "react";
import { useMe } from "@/api/hooks/useMe";
import { canCreateLearner } from "@/utils/rbac";

interface CreateLearnerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  linkedinUrl: string;
  source: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  source?: string;
}

export default function CreateLearnerDialog({
  open,
  onClose,
  onSuccess,
}: CreateLearnerDialogProps): ReactElement | null {
  const { enqueueSnackbar } = useSnackbar();
  const { data: me } = useMe();
  const { createLearner } = usePeople({});
  const { settings } = useSettings();
  const firstNameRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    linkedinUrl: "",
    source: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus first field when dialog opens
  useEffect(() => {
    if (open && firstNameRef.current) {
      setTimeout(() => firstNameRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        linkedinUrl: "",
        source: "",
      });
      setFieldErrors({});
    }
  }, [open]);

  const validateField = (
    name: keyof FormData,
    value: string
  ): string | undefined => {
    switch (name) {
      case "firstName":
        return value.trim() ? undefined : "First name is required";
      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value)
          ? undefined
          : "Please enter a valid email address";
      case "phone":
        if (!value.trim()) return undefined;
        const phoneRegex = /^[\d\s+\-()]{1,40}$/;
        return phoneRegex.test(value)
          ? undefined
          : "Phone can only contain digits, spaces, +, -, (, )";
      case "city":
        if (!value.trim()) return undefined;
        return value.length <= 120
          ? undefined
          : "City must be 120 characters or less";
      case "linkedinUrl":
        if (!value.trim()) return undefined;
        try {
          const url = new URL(value);
          return url.protocol === "https:" || url.protocol === "http:"
            ? undefined
            : "Please enter a valid URL (https:// recommended)";
        } catch {
          return "Please enter a valid URL";
        }
      default:
        return undefined;
    }
  };

  const handleChange =
    (field: keyof FormData) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: string } }
    ) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear field error when user starts typing
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async () => {
    // Validate all fields
    const errors: FieldErrors = {};
    let firstInvalidField: keyof FormData | null = null;

    Object.keys(formData).forEach((key) => {
      const field = key as keyof FormData;
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        if (!firstInvalidField) firstInvalidField = field;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Focus first invalid field
      if (firstInvalidField === "firstName" && firstNameRef.current) {
        firstNameRef.current.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const payload: CreatePersonRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        city: formData.city.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        source: formData.source || undefined,
        status: "SUSPECT", // Default status
      };

      await createLearner.mutateAsync(payload);

      enqueueSnackbar("Learner created. Owner set to you.", {
        variant: "success",
      });
      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      const errorObj = error as {
        message?: string;
        details?: Record<string, string>;
        code?: string;
      };

      if (errorObj.details) {
        setFieldErrors(errorObj.details as FieldErrors);
        enqueueSnackbar("Please fix the errors below", { variant: "error" });
      } else {
        if (errorObj.code === "INVALID_PHONE") {
          setFieldErrors((prev) => ({
            ...prev,
            phone: "Please enter a valid phone number",
          }));
        }
        enqueueSnackbar(errorObj.message || "Failed to create learner", {
          variant: "error",
          action: (
            <Button color="inherit" size="small" onClick={handleSubmit}>
              Retry
            </Button>
          ),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!canCreateLearner(me?.role)) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Learner</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField
            inputRef={firstNameRef}
            label="First Name"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            error={!!fieldErrors.firstName}
            helperText={fieldErrors.firstName}
            required
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            error={!!fieldErrors.lastName}
            helperText={fieldErrors.lastName}
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email || "Work or personal email"}
            required
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label="Phone"
            value={formData.phone}
            onChange={handleChange("phone")}
            error={!!fieldErrors.phone}
            helperText={
              fieldErrors.phone || "Optional - digits, spaces, +, -, (, )"
            }
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label="City"
            value={formData.city}
            onChange={handleChange("city")}
            error={!!fieldErrors.city}
            helperText={fieldErrors.city || "Optional - max 120 characters"}
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label="LinkedIn URL"
            value={formData.linkedinUrl}
            onChange={handleChange("linkedinUrl")}
            error={!!fieldErrors.linkedinUrl}
            helperText={
              fieldErrors.linkedinUrl || "https://linkedin.com/in/..."
            }
            fullWidth
            disabled={isSubmitting}
          />

          <FormControl fullWidth disabled={isSubmitting}>
            <InputLabel>Source</InputLabel>
            <Select
              value={formData.source}
              onChange={handleChange("source")}
              label="Source"
              error={!!fieldErrors.source}
            >
              <MenuItem value="">
                <em>Select a source</em>
              </MenuItem>
              {settings.data?.sources?.map((source: string) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.source && (
              <Box
                sx={{
                  color: "error.main",
                  fontSize: "0.75rem",
                  mt: 0.5,
                  ml: 1.75,
                }}
              >
                {fieldErrors.source}
              </Box>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {isSubmitting ? "Creating..." : "Create Learner"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
