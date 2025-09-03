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
import {
  usePeople,
  type PatchPersonRequest,
  type Person,
} from "@/api/hooks/usePeople";
import { useSettings } from "@/api/hooks/useSettings";
import type { ReactElement } from "react";

interface EditLearnerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  learner: Person | null;
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

export default function EditLearnerDialog({
  open,
  onClose,
  onSuccess,
  learner,
}: EditLearnerDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar();
  const { patchLearner } = usePeople({});
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

  const [initialData, setInitialData] = useState<FormData>({
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

  // Populate form when learner data is available
  useEffect(() => {
    if (open && learner) {
      const data: FormData = {
        firstName: learner.firstName || "",
        lastName: learner.lastName || "",
        email: learner.email || "",
        phone: learner.phone || "",
        city: learner.city || "",
        linkedinUrl: learner.linkedinUrl || "",
        source: learner.source || "",
      };
      setFormData(data);
      setInitialData(data);
      setFieldErrors({});
    }
  }, [open, learner]);

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

  const getChangedFields = (): PatchPersonRequest => {
    const changes: PatchPersonRequest = {};

    Object.keys(formData).forEach((key) => {
      const field = key as keyof FormData;
      const currentValue = formData[field];
      const initialValue = initialData[field];

      // Only include changed fields
      if (currentValue !== initialValue) {
        if (currentValue.trim() === "") {
          changes[field] = undefined;
        } else {
          changes[field] = currentValue.trim();
        }
      }
    });

    return changes;
  };

  const handleSubmit = async () => {
    if (!learner) return;

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

    const changes = getChangedFields();

    // If no changes, just close
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      await patchLearner.mutateAsync({ id: learner.id, payload: changes });

      enqueueSnackbar("Learner updated successfully", { variant: "success" });
      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      const errorObj = error as {
        message?: string;
        details?: Record<string, string>;
      };

      if (errorObj.details) {
        // Field-specific errors from backend
        setFieldErrors(errorObj.details as FieldErrors);
        enqueueSnackbar("Please fix the errors below", { variant: "error" });
      } else {
        // General error
        enqueueSnackbar(errorObj.message || "Failed to update learner", {
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Learner</DialogTitle>
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
          {isSubmitting ? "Updating..." : "Update Learner"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
