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
import { useAuth } from "@/auth/useAuth";
import { fetchJson } from "@/api/client";
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
  stage?: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  source?: string;
  stage?: string;
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
  const { accessToken } = useAuth();
  const firstNameRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    linkedinUrl: "",
    source: "",
    stage: "",
  });

  const [initialData, setInitialData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    linkedinUrl: "",
    source: "",
    stage: "",
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
        stage: learner.stage || "",
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

    (Object.keys(formData) as (keyof FormData)[]).forEach((field) => {
      const currentValue = (formData[field] ?? "") as string;
      const initialValue = (initialData[field] ?? "") as string;

      // Only include changed fields
      if (currentValue !== initialValue) {
        if (currentValue.trim() === "") {
          (changes as Record<string, unknown>)[field as string] = undefined;
        } else {
          (changes as Record<string, unknown>)[field as string] =
            currentValue.trim();
        }
      }
    });

    return changes;
  };

  // When status changes elsewhere and stage becomes invalid, caller should pass updated learner; here we just ensure selected stage is valid for status when opening
  useEffect(() => {
    if (open && learner?.status && formData.stage) {
      const validStages = settings.data?.stagesByStatus?.[learner.status] || [];
      if (validStages.length > 0 && !validStages.includes(formData.stage)) {
        setFormData((prev) => ({ ...prev, stage: "" }));
      }
    }
  }, [open, learner?.status, formData.stage, settings.data?.stagesByStatus]);

  const handleSubmit = async () => {
    if (!learner) return;

    // Validate all fields
    const errors: FieldErrors = {};
    let firstInvalidField: keyof FormData | null = null;

    (Object.keys(formData) as (keyof FormData)[]).forEach((field) => {
      const error = validateField(field, (formData[field] ?? "") as string);
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
    const stageChanged = (formData.stage ?? "") !== (initialData.stage ?? "");
    const stageValue = formData.stage ?? "";
    delete (changes as Record<string, unknown>)["stage"];

    // If no changes, just close
    if (Object.keys(changes).length === 0 && !stageChanged) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      // If other fields changed, patch them first
      if (Object.keys(changes).length > 0) {
        await patchLearner.mutateAsync({ id: learner.id, payload: changes });
      }
      // If stage changed, patch stage via dedicated endpoint
      if (stageChanged) {
        await fetchJson(`/api/v1/learners/${learner.id}/stage`, {
          method: "PATCH",
          body: { stage: stageValue },
          token: accessToken || undefined,
        });
      }

      enqueueSnackbar("Learner updated successfully", { variant: "success" });
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
          {/* Stage (status-aware) */}
          <FormControl
            fullWidth
            disabled={
              isSubmitting ||
              !(
                learner?.status &&
                settings.data?.stagesByStatus?.[learner.status]?.length
              )
            }
          >
            <InputLabel>Stage</InputLabel>
            <Select
              value={formData.stage || ""}
              onChange={handleChange("stage")}
              label="Stage"
            >
              {learner?.status &&
              settings.data?.stagesByStatus?.[learner.status]
                ? settings.data.stagesByStatus[learner.status].map((stage) => (
                    <MenuItem key={stage} value={stage}>
                      {stage}
                    </MenuItem>
                  ))
                : [
                    <MenuItem key="_none" value="">
                      <em>No stages</em>
                    </MenuItem>,
                  ]}
            </Select>
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
