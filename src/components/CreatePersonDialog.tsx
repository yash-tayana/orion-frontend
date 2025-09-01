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
import { usePeople } from "@/api/hooks/usePeople";

interface CreatePersonDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePersonDialog({
  open,
  onClose,
}: CreatePersonDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { create } = usePeople({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    source: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }
    if (formData.linkedinUrl && !formData.linkedinUrl.includes("linkedin.com")) {
      newErrors.linkedinUrl = "Invalid LinkedIn URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await create.mutateAsync(formData);
      enqueueSnackbar("Person created successfully", { variant: "success" });
      handleClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create person";
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      linkedinUrl: "",
      source: "",
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Person</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <Box display="flex" gap={2}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              fullWidth
              required
            />
          </Box>
          
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            required
          />
          
          <TextField
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
            placeholder="+1-555-555-5555"
          />
          
          <TextField
            label="LinkedIn URL"
            value={formData.linkedinUrl}
            onChange={(e) => handleChange("linkedinUrl", e.target.value)}
            error={!!errors.linkedinUrl}
            helperText={errors.linkedinUrl}
            fullWidth
            placeholder="https://linkedin.com/in/username"
          />
          
          <FormControl fullWidth>
            <InputLabel>Source</InputLabel>
            <Select
              value={formData.source}
              onChange={(e) => handleChange("source", e.target.value)}
              label="Source"
            >
              <MenuItem value="">Select source</MenuItem>
              <MenuItem value="seed">Seed</MenuItem>
              <MenuItem value="referral">Referral</MenuItem>
              <MenuItem value="website">Website</MenuItem>
              <MenuItem value="social">Social Media</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            <FormHelperText>How did you find this person?</FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={create.isPending}
        >
          {create.isPending ? "Creating..." : "Create Person"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
