"use client";

import { useState, useMemo } from "react";
import { Box, Button, Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

import { usePeople } from "@/api/hooks/usePeople";
import { useMe } from "@/api/hooks/useMe";
import { isAdmin } from "@/utils/rbac";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import SegmentedControl from "@/components/SegmentedControl";
import KebabMenu from "@/components/KebabMenu";
import EmptyState from "@/components/EmptyState";
import CreatePersonDialog from "@/components/CreatePersonDialog";

export default function PeoplePage(): React.ReactElement {
  const { data: me } = useMe();
  const router = useRouter();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  const { list } = usePeople({
    status: status || undefined,
    q: q || undefined,
  });

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        renderCell: (params) => (
          <Box>
            <Box fontWeight={600}>
              {params.row.firstName} {params.row.lastName}
            </Box>
            <Box fontSize="0.875rem" color="text.secondary">
              {params.row.email}
            </Box>
          </Box>
        ),
      },
      {
        field: "phone",
        headerName: "Phone",
        width: 150,
        renderCell: (params) => params.row.phone || "—",
      },
      {
        field: "source",
        headerName: "Source",
        width: 120,
        renderCell: (params) => (
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: "rgba(99,102,241,0.1)",
              color: "primary.main",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {params.row.source || "Unknown"}
          </Box>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: (params) => (
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor:
                params.row.status === "LEAD"
                  ? "rgba(34,197,94,0.1)"
                  : params.row.status === "CANDIDATE_FREE"
                  ? "rgba(59,130,246,0.1)"
                  : "rgba(156,163,175,0.1)",
              color:
                params.row.status === "LEAD"
                  ? "success.main"
                  : params.row.status === "CANDIDATE_FREE"
                  ? "primary.main"
                  : "text.secondary",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {params.row.status.replace("_", " ")}
          </Box>
        ),
      },
      {
        field: "createdAt",
        headerName: "Added",
        width: 120,
        renderCell: (params) =>
          new Date(params.row.createdAt).toLocaleDateString(),
      },
      {
        field: "actions",
        headerName: "",
        width: 80,
        sortable: false,
        renderCell: (params) => (
          <KebabMenu
            items={[
              {
                label: "View details",
                onClick: () => router.push(`/admin/people/${params.row.id}`),
              },
              ...(isAdmin(me?.role)
                ? [
                    {
                      label: "Promote",
                      onClick: () =>
                        router.push(`/admin/people/${params.row.id}`),
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [me?.role, router]
  );

  return (
    <>
      <PageHeader
        title="People"
        description="Manage suspects, leads and candidate-free cohorts."
        actions={
          isAdmin(me?.role) ? (
            <Button variant="contained" onClick={() => setOpenCreate(true)}>
              New Person
            </Button>
          ) : null
        }
      />
      <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
        <SearchInput value={q} onChange={setQ} placeholder="Search people" />
        <SegmentedControl
          value={status}
          onChange={setStatus}
          segments={[
            { label: "All", value: "" },
            { label: "Suspect", value: "SUSPECT" },
            { label: "Lead", value: "LEAD" },
            { label: "Candidate-Free", value: "CANDIDATE_FREE" },
          ]}
        />
      </Box>
      <Paper sx={{ height: 620, width: "100%", overflow: "hidden" }}>
        <DataGrid
          rows={(list.data || []).map((p) => ({ ...p, id: p.id }))}
          columns={columns}
          loading={list.isLoading}
          disableRowSelectionOnClick
          onRowClick={(p) => router.push(`/admin/people/${p.id}`)}
          disableColumnMenu
          rowHeight={56}
          columnHeaderHeight={48}
          checkboxSelection={false}
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
                title="No people found"
                description="Get started by adding your first person to the system."
                actionLabel={
                  isAdmin(me?.role) ? "Add your first person" : undefined
                }
                onAction={
                  isAdmin(me?.role) ? () => setOpenCreate(true) : undefined
                }
              />
            ),
          }}
        />
      </Paper>

      <CreatePersonDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </>
  );
}
