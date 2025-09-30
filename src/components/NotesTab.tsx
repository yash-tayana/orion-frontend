"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  IconButton,
  Chip,
  Tooltip,
  Skeleton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useSnackbar } from "notistack";
import { formatDistanceToNow } from "date-fns";
import { useLearnerNotes, type LearnerNote } from "@/api/hooks/useLearnerNotes";
import { useMe } from "@/api/hooks/useMe";
import { canViewNotes, canDeleteNote, canAddNotes } from "@/utils/rbac";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { ReactElement } from "react";
import { ApiError } from "@/api/errors";
import { getCrmCopy } from "@/utils/crmCopy";

interface NotesTabProps {
  learnerId: string;
  ownerUserId?: string | null;
}

export default function NotesTab({
  learnerId,
  ownerUserId,
}: NotesTabProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar();
  const { data: me } = useMe();
  const { notes, create, delete: deleteNote } = useLearnerNotes(learnerId);
  const [newNote, setNewNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<LearnerNote | null>(null);
  const copy = getCrmCopy();

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    try {
      await create.mutateAsync({
        text: newNote.trim(),
        files: files.length > 0 ? files : undefined,
      });
      setNewNote("");
      setFiles([]);
      enqueueSnackbar("Note added", { variant: "success" });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 403) {
        enqueueSnackbar(`You can only add notes to ${copy.plural} you own.`, {
          variant: "info",
        });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to add note";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    }
  };

  const handleDeleteClick = (note: LearnerNote) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNote.mutateAsync(noteToDelete.id);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
      enqueueSnackbar("Note deleted", { variant: "success" });
      // Ensure UI reflects deletion promptly
      await notes.refetch();
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 403) {
        enqueueSnackbar("You can only delete your own note", {
          variant: "error",
        });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete note";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getAbsoluteUrl = (url: string): string => url;

  const renderAttachment = (attachment: unknown) => {
    const att = attachment as Record<string, unknown>;
    const mimeType = att.mimeType as string;
    const sizeBytes = att.sizeBytes as number;
    const rawUrl = att.url as string;
    const absoluteUrl = getAbsoluteUrl(rawUrl);
    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType === "application/pdf";

    if (isImage) {
      return (
        <Box
          key={att.id as string}
          sx={{
            maxHeight: 120,
            borderRadius: 1,
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.2)",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
          onClick={() =>
            window.open(absoluteUrl, "_blank", "noopener,noreferrer")
          }
        >
          <img
            src={absoluteUrl}
            alt={att.fileName as string}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: 120,
              objectFit: "cover",
            }}
          />
        </Box>
      );
    }

    if (isPdf) {
      return (
        <Box
          key={att.id as string}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1,
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 1,
            bgcolor: "rgba(99,102,241,0.05)",
          }}
        >
          <PictureAsPdfIcon color="error" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2">{att.fileName as string}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(sizeBytes)}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            href={absoluteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open
          </Button>
        </Box>
      );
    }

    return (
      <Box
        key={att.id as string}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          border: "1px solid rgba(148,163,184,0.2)",
          borderRadius: 1,
          bgcolor: "rgba(148,163,184,0.05)",
        }}
      >
        <InsertDriveFileIcon />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">{att.fileName as string}</Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(sizeBytes)}
          </Typography>
        </Box>
        <Button size="small" variant="outlined" href={absoluteUrl} download>
          Download
        </Button>
      </Box>
    );
  };

  if (!canViewNotes(me?.role)) {
    return (
      <Box
        height={600}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography color="text.secondary">
          You don&apos;t have permission to view notes.
        </Typography>
      </Box>
    );
  }

  if (notes.isLoading) {
    return (
      <Box height={600} display="flex" flexDirection="column" gap={2}>
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={120} />
      </Box>
    );
  }

  // We need the learner's ownerUserId to compute canWrite; notes API does not include learner details,
  // so when used inside learner drawer, pass it via props in parent or rely on context. For now, fetch is omitted;
  // compute conservatively as false unless author is me.
  const canWrite = canAddNotes(me?.role, me?.id, ownerUserId ?? null);

  return (
    <Box height={600} display="flex" flexDirection="column" gap={2}>
      {/* Add Note Form */}
      <Paper sx={{ p: 2, bgcolor: "rgba(148,163,184,0.05)" }}>
        <Stack spacing={2}>
          <TextField
            label="Add a note"
            multiline
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            fullWidth
            required
            disabled={!canWrite}
          />

          <Box>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                component="span"
                startIcon={<AttachFileIcon />}
                variant="outlined"
                size="small"
                disabled={!canWrite}
              >
                Attach Files
              </Button>
            </label>
            {files.length > 0 && (
              <Box mt={1}>
                {files.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    size="small"
                    onDelete={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canWrite || !newNote.trim() || create.isPending}
          >
            {create.isPending ? "Adding..." : "Add Note"}
          </Button>
          {!canWrite && (
            <Typography variant="caption" color="text.secondary">
              {`Read-only for your role. You can add notes for ${copy.plural} you own.`}
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Notes List */}
      <Box flex={1} overflow="auto">
        {!notes.data || notes.data.length === 0 ? (
          <EmptyState
            title="No notes yet"
            description={`Add your first note to start tracking this ${copy.singular}'s progress.`}
            actionLabel="Add your first note"
            onAction={() => document.getElementById("file-input")?.focus()}
          />
        ) : (
          <Stack spacing={2}>
            {notes.data.map((note, index) => (
              <Box key={note.id}>
                <Paper sx={{ p: 2, bgcolor: "rgba(148,163,184,0.05)" }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {note.author.displayName || note.author.email}
                      </Typography>
                      <Tooltip
                        title={new Date(note.createdAt).toLocaleString()}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(note.createdAt), {
                            addSuffix: true,
                          })}
                        </Typography>
                      </Tooltip>
                    </Box>
                    {canDeleteNote(
                      me?.role,
                      me?.id || undefined,
                      note.author.id
                    ) && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(note)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{ mb: 2, whiteSpace: "pre-wrap" }}
                  >
                    {note.text}
                  </Typography>

                  {note.attachments && note.attachments.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Attachments:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {note.attachments.map(renderAttachment)}
                      </Box>
                    </Box>
                  )}
                </Paper>
                {index < notes.data.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setNoteToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete note by ${
          noteToDelete?.author.displayName || noteToDelete?.author.email
        }?`}
        confirmLabel="Delete"
      />
    </Box>
  );
}
