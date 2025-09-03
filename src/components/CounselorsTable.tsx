"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Button,
  IconButton,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useCounselors, type Counselor } from "@/api/hooks/useCounselors";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";

interface CounselorsTableProps {
  onCreate: () => void;
  onEdit: (counselor: Counselor) => void;
}

export default function CounselorsTable({
  onCreate,
  onEdit,
}: CounselorsTableProps) {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const { counselors, delete: deleteCounselor } = useCounselors(filter);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [counselorToDelete, setCounselorToDelete] = useState<Counselor | null>(
    null
  );

  const handleDeleteClick = (counselor: Counselor) => {
    setCounselorToDelete(counselor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!counselorToDelete) return;

    try {
      await deleteCounselor.mutateAsync(counselorToDelete.id);
      setDeleteDialogOpen(false);
      setCounselorToDelete(null);
    } catch {
      // Error handling is done in the mutation
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "embedUrl",
      headerName: "Embed URL",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 300,
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "isActive",
      headerName: "Active",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => onEdit(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(params.row)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (counselors.isLoading) {
    return (
      <Paper
        sx={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Loading counselors...</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Counselors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          Add Counselor
        </Button>
      </Box>

      {/* Filter chips */}
      <Stack direction="row" spacing={1} mb={2}>
        <Chip
          label="All"
          onClick={() => setFilter("all")}
          color={filter === "all" ? "primary" : "default"}
          variant={filter === "all" ? "filled" : "outlined"}
        />
        <Chip
          label="Active"
          onClick={() => setFilter("active")}
          color={filter === "active" ? "primary" : "default"}
          variant={filter === "active" ? "filled" : "outlined"}
        />
        <Chip
          label="Inactive"
          onClick={() => setFilter("inactive")}
          color={filter === "inactive" ? "primary" : "default"}
          variant={filter === "inactive" ? "filled" : "outlined"}
        />
      </Stack>

      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={counselors.data || []}
          columns={columns}
          loading={counselors.isLoading}
          disableRowSelectionOnClick
          disableColumnMenu
          rowHeight={56}
          columnHeaderHeight={48}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#F1F5F9",
              color: "#475569",
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "rgba(99,102,241,.04)",
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <EmptyState
                title="No counselors found"
                description="Get started by adding your first counselor."
                actionLabel="Add your first counselor"
                onAction={onCreate}
              />
            ),
          }}
        />
      </Paper>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCounselorToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${counselorToDelete?.name}"?`}
        confirmLabel="Delete"
      />
    </>
  );
}
