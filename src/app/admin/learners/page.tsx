"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Paper,
  Menu,
  MenuItem,
  Chip,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";

import { usePeople, type Person } from "@/api/hooks/usePeople";
import { useMe } from "@/api/hooks/useMe";
import { useSettings } from "@/api/hooks/useSettings";
import { isAdmin } from "@/utils/rbac";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import SegmentedControl from "@/components/SegmentedControl";
import KebabMenu from "@/components/KebabMenu";
import EmptyState from "@/components/EmptyState";
import CreateLearnerDialog from "@/components/CreateLearnerDialog";
import EditLearnerDialog from "@/components/EditLearnerDialog";
import StatusChip from "@/components/StatusChip";

export default function LearnersPage(): React.ReactElement {
  const { data: me } = useMe();
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState("");
  const [source, setSource] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  // Initialize filters from URL parameters
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const stageParam = searchParams.get("stage");
    const sourceParam = searchParams.get("source");
    const qParam = searchParams.get("q");

    if (statusParam) setStatus(statusParam);
    if (stageParam) setStage(stageParam);
    if (sourceParam) setSource(sourceParam);
    if (qParam) setQ(qParam);
  }, [searchParams]);

  // URL synchronization
  const updateURL = useCallback(
    (newParams: {
      status?: string;
      stage?: string;
      source?: string;
      q?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const newURL = `${window.location.pathname}?${params.toString()}`;
      router.replace(newURL);
    },
    [searchParams, router]
  );

  const clearAllFilters = useCallback(() => {
    setQ("");
    setStatus("");
    setStage("");
    setSource("");
    updateURL({ q: "", status: "", stage: "", source: "" });
  }, [updateURL]);

  // Handle stage clearing when status changes
  useEffect(() => {
    if (status && stage && settings.data?.stagesByStatus?.[status]) {
      const availableStages = settings.data.stagesByStatus[status];
      if (!availableStages.includes(stage)) {
        setStage("");
        updateURL({ stage: "" });
      }
    }
  }, [status, stage, settings.data?.stagesByStatus, updateURL]);

  const { list } = usePeople({
    status: status || undefined,
    stage: stage || undefined,
    source: source || undefined,
    q: q || undefined,
  });

  // Handle backend validation errors
  useEffect(() => {
    if (list.error) {
      const error = list.error as { message?: string };
      if (error?.message?.includes("INVALID_STAGE_FOR_STATUS")) {
        enqueueSnackbar(error.message, { variant: "error" });
        setStage("");
        updateURL({ stage: "" });
      }
    }
  }, [list.error, enqueueSnackbar, updateURL]);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Box>
              <Box fontWeight={600}>
                {params.row.firstName} {params.row.lastName}
              </Box>
              <Box fontSize="0.875rem" color="text.secondary">
                {params.row.email}
              </Box>
            </Box>
            {params.row.linkedinUrl && (
              <Tooltip title="View LinkedIn Profile">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      params.row.linkedinUrl,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  sx={{ ml: 1 }}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
      {
        field: "phone",
        headerName: "Phone",
        width: 150,
        renderCell: (params) => (
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
            title={params.row.phone || "No phone"}
          >
            {params.row.phone || "—"}
          </Box>
        ),
      },
      {
        field: "city",
        headerName: "City",
        width: 120,
        renderCell: (params) => (
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
            title={params.row.city || "No city"}
          >
            {params.row.city || "—"}
          </Box>
        ),
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
        renderCell: (params) => <StatusChip status={params.row.status} />,
      },
      {
        field: "stage",
        headerName: "Stage",
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.row.stage || "None"}
            size="small"
            variant="outlined"
            color={params.row.stage ? "primary" : "default"}
          />
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
                onClick: () => router.push(`/admin/learners/${params.row.id}`),
              },
              ...(isAdmin(me?.role)
                ? [
                    {
                      label: "Edit",
                      onClick: () => {
                        setSelectedPerson(params.row);
                        setOpenEdit(true);
                      },
                    },
                    {
                      label: "Promote",
                      onClick: () =>
                        router.push(`/admin/learners/${params.row.id}`),
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
      {list.isLoading && <LinearProgress />}
      <PageHeader
        title="Learners"
        description="Manage suspects, leads and candidate-free cohorts."
        actions={
          isAdmin(me?.role) ? (
            <Button variant="contained" onClick={() => setOpenCreate(true)}>
              New Learner
            </Button>
          ) : null
        }
      />
      <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
        <SearchInput
          value={q}
          onChange={(value) => {
            setQ(value);
            updateURL({ q: value });
          }}
          placeholder="Search learners"
        />
        <SegmentedControl
          value={status}
          onChange={(value) => {
            setStatus(value);
            updateURL({ status: value });
          }}
          segments={[
            { label: "All", value: "" },
            { label: "Suspect", value: "SUSPECT" },
            { label: "Lead", value: "LEAD" },
            { label: "Candidate-Free", value: "CANDIDATE_FREE" },
          ]}
        />

        {/* Stage Filter */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Stage</InputLabel>
          <Select
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              updateURL({ stage: e.target.value });
            }}
            label="Stage"
            disabled={!status}
          >
            <MenuItem value="">
              <em>All Stages</em>
            </MenuItem>
            {status &&
              settings.data?.stagesByStatus?.[status]?.map(
                (stageOption: string) => (
                  <MenuItem key={stageOption} value={stageOption}>
                    {stageOption}
                  </MenuItem>
                )
              )}
          </Select>
        </FormControl>

        {/* Source Filter */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Source</InputLabel>
          <Select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              updateURL({ source: e.target.value });
            }}
            label="Source"
          >
            <MenuItem value="">
              <em>All Sources</em>
            </MenuItem>
            <MenuItem value="Unknown">Unknown</MenuItem>
            {settings.data?.sources?.map((sourceOption: string) => (
              <MenuItem key={sourceOption} value={sourceOption}>
                {sourceOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
          sx={{ minWidth: 80 }}
        >
          More
        </Button>

        {/* Active Filters Summary */}
        {(status || stage || source || q) && (
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {status && (
              <Chip
                label={`Status: ${status}`}
                size="small"
                onDelete={() => {
                  setStatus("");
                  updateURL({ status: "" });
                }}
                color="primary"
                variant="outlined"
              />
            )}
            {stage && (
              <Chip
                label={`Stage: ${stage}`}
                size="small"
                onDelete={() => {
                  setStage("");
                  updateURL({ stage: "" });
                }}
                color="primary"
                variant="outlined"
              />
            )}
            {source && (
              <Chip
                label={`Source: ${source}`}
                size="small"
                onDelete={() => {
                  setSource("");
                  updateURL({ source: "" });
                }}
                color="primary"
                variant="outlined"
              />
            )}
            {q && (
              <Chip
                label={`Search: "${q}"`}
                size="small"
                onDelete={() => {
                  setQ("");
                  updateURL({ q: "" });
                }}
                color="primary"
                variant="outlined"
              />
            )}
            <Button size="small" onClick={clearAllFilters} sx={{ ml: 1 }}>
              Clear All
            </Button>
          </Box>
        )}
        <Menu
          anchorEl={moreMenuAnchor}
          open={Boolean(moreMenuAnchor)}
          onClose={() => setMoreMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setStatus("CANDIDATE_PAID");
              setMoreMenuAnchor(null);
            }}
          >
            <Chip
              size="small"
              label="CANDIDATE_PAID"
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            Candidate Paid
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatus("ALUMNI");
              setMoreMenuAnchor(null);
            }}
          >
            <Chip
              size="small"
              label="ALUMNI"
              color="secondary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            Alumni
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatus("DEFERRED");
              setMoreMenuAnchor(null);
            }}
          >
            <Chip
              size="small"
              label="DEFERRED"
              color="warning"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            Deferred
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatus("DISCONTINUED");
              setMoreMenuAnchor(null);
            }}
          >
            <Chip
              size="small"
              label="DISCONTINUED"
              color="error"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            Discontinued
          </MenuItem>
        </Menu>
      </Box>
      <Paper sx={{ height: 620, width: "100%", overflow: "hidden" }}>
        <DataGrid
          rows={(list.data || []).map((p) => ({ ...p, id: p.id }))}
          columns={columns}
          loading={list.isLoading}
          disableRowSelectionOnClick
          onRowClick={(p) => router.push(`/admin/learners/${p.id}`)}
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
            noRowsOverlay: () => {
              const activeFilters = [];
              if (status) activeFilters.push(`status ${status}`);
              if (stage) activeFilters.push(`stage "${stage}"`);
              if (source) activeFilters.push(`source "${source}"`);
              if (q) activeFilters.push(`search "${q}"`);

              const filterText =
                activeFilters.length > 0
                  ? ` for ${activeFilters.join(" & ")}`
                  : "";

              return (
                <EmptyState
                  title={`No learners found${filterText}`}
                  description={
                    activeFilters.length > 0
                      ? "Try adjusting your filters to see more results."
                      : "Get started by adding your first learner to the system."
                  }
                  actionLabel={
                    isAdmin(me?.role) && activeFilters.length === 0
                      ? "Add your first learner"
                      : undefined
                  }
                  onAction={
                    isAdmin(me?.role) && activeFilters.length === 0
                      ? () => setOpenCreate(true)
                      : undefined
                  }
                />
              );
            },
          }}
        />
      </Paper>

      <CreateLearnerDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => {
          // Check if new learner would be visible under current filters
          // If not, show a toast message
          if (status && status !== "SUSPECT") {
            enqueueSnackbar(
              "Created learner (not visible under current filters)",
              {
                variant: "info",
              }
            );
          }
        }}
      />

      {selectedPerson && (
        <EditLearnerDialog
          open={openEdit}
          onClose={() => {
            setOpenEdit(false);
            setSelectedPerson(null);
          }}
          learner={selectedPerson}
        />
      )}
    </>
  );
}
