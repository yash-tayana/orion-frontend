"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useState, useEffect, type ReactElement } from "react";

export default function ConfirmDialog({
  open,
  title,
  confirmLabel = "Confirm",
  onClose,
  onConfirm,
  requireReason = false,
}: {
  open: boolean;
  title: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  requireReason?: boolean;
}): ReactElement {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {requireReason && (
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={() => onConfirm(reason)} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
