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
import {
  isAdmin,
  isSales,
  canCreateLearner,
  canEditLearner,
} from "@/utils/rbac";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import SegmentedControl from "@/components/SegmentedControl";
import KebabMenu from "@/components/KebabMenu";
import EmptyState from "@/components/EmptyState";
import CreateLearnerDialog from "@/components/CreateLearnerDialog";
import EditLearnerDialog from "@/components/EditLearnerDialog";
import StatusChip from "@/components/StatusChip";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";
import { ApiError } from "@/api/errors";
import { getCrmCopy } from "@/utils/crmCopy";

export default function LearnersPage(): React.ReactElement {
  const { data: me } = useMe();
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState("");
  const [source, setSource] = useState("");
  const [owner, setOwner] = useState<string>("");
  const [ownerUserId, setOwnerUserId] = useState<string>("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [setStageOpen, setSetStageOpen] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  // Initialize filters from URL parameters
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const stageParam = searchParams.get("stage");
    const sourceParam = searchParams.get("source");
    const qParam = searchParams.get("q");
    const ownerParam = searchParams.get("owner");
    const ownerUserIdParam = searchParams.get("ownerUserId");

    if (statusParam) setStatus(statusParam);
    if (stageParam) setStage(stageParam);
    if (sourceParam) setSource(sourceParam);
    if (qParam) setQ(qParam);
    if (ownerParam === "unassigned") setOwner("unassigned");
    if (ownerUserIdParam) setOwnerUserId(ownerUserIdParam);
  }, [searchParams]);

  // URL synchronization without navigation (no re-mount)
  const updateURL = useCallback(
    (newParams: {
      status?: string;
      stage?: string;
      source?: string;
      q?: string;
      owner?: string;
      ownerUserId?: string;
    }) => {
      const url = new URL(window.location.href);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value);
        } else {
          url.searchParams.delete(key);
        }
      });
      window.history.replaceState(null, "", url.toString());
    },
    []
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
    owner: owner === "unassigned" ? "unassigned" : undefined,
    ownerUserId: ownerUserId || undefined,
  });

  // Debug preview of owner objects (temporary)
  useEffect(() => {
    if (list.data && list.data.length > 0) {
      // eslint-disable-next-line no-console
      console.debug(
        "People rows preview:",
        list.data.slice(0, 3).map((r) => ({ id: r.id, owner: r.owner }))
      );
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "RBAC preview:",
          list.data.slice(0, 3).map((r) => ({
            id: r.id,
            owner: r.owner?.email,
            ownerId: r.ownerUserId,
          }))
        );
      }
    }
  }, [list.data]);

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
        renderCell: (params: { row?: Person } | null) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Box>
              <Box fontWeight={600}>
                {params?.row?.firstName} {params?.row?.lastName}
              </Box>
              <Box fontSize="0.875rem" color="text.secondary">
                {params?.row?.email}
              </Box>
            </Box>
            {params?.row?.linkedinUrl && (
              <Tooltip title="View LinkedIn Profile">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      params?.row?.linkedinUrl || undefined,
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
        renderCell: (params: { row?: Person } | null) => (
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
            title={params?.row?.phone || "No phone"}
          >
            {params?.row?.phone || "—"}
          </Box>
        ),
      },
      {
        field: "city",
        headerName: "City",
        width: 120,
        renderCell: (params: { row?: Person } | null) => (
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
            title={params?.row?.city || "No city"}
          >
            {params?.row?.city || "—"}
          </Box>
        ),
      },
      {
        field: "source",
        headerName: "Source",
        width: 120,
        renderCell: (params: { row?: Person } | null) => (
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
            {params?.row?.source || "Unknown"}
          </Box>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: (params: { row?: Person } | null) => (
          <StatusChip status={params?.row?.status as any} />
        ),
      },
      {
        field: "stage",
        headerName: "Stage",
        width: 120,
        renderCell: (params: { row?: Person } | null) => (
          <Chip
            label={params?.row?.stage || "None"}
            size="small"
            variant="outlined"
            color={params?.row?.stage ? "primary" : "default"}
          />
        ),
      },
      {
        field: "owner",
        headerName: "Owner",
        width: 220,
        sortable: false,
        valueGetter: (params: { row?: Person } | null) => {
          const o = params?.row?.owner as Person["owner"] | null | undefined;
          return (
            (o?.displayName && o.displayName.trim()) || o?.email || "Unassigned"
          );
        },
        renderCell: (params: { row?: Person } | null) => {
          const o = params?.row?.owner as Person["owner"] | null | undefined;
          const label =
            (o?.displayName && o.displayName.trim()) ||
            o?.email ||
            "Unassigned";
          return <span title={label}>{label}</span>;
        },
      },
      {
        field: "createdAt",
        headerName: "Added",
        width: 120,
        renderCell: (params: { row?: Person } | null) =>
          params?.row?.createdAt
            ? new Date(params.row.createdAt).toLocaleDateString()
            : "-",
      },
      {
        field: "actions",
        headerName: "",
        width: 80,
        sortable: false,
        renderCell: (params: { row?: Person } | null) => {
          const items: {
            label: string;
            onClick: () => void;
            disabled?: boolean;
          }[] = [
            {
              label: "View details",
              onClick: () =>
                params?.row && router.push(`/admin/learners/${params.row.id}`),
            },
          ];
          if (
            params?.row &&
            params.row.ownerUserId == null &&
            (isSales(me?.role) || isAdmin(me?.role))
          ) {
            items.push({
              label: "Assign to me",
              onClick: async () => {
                try {
                  await fetch(`/api/v1/people/${params.row!.id}/owner`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ownerUserId: me?.id }),
                  });
                  enqueueSnackbar("Assigned to you", { variant: "success" });
                  await list.refetch();
                } catch {
                  enqueueSnackbar(
                    "You can only assign yourself; contact admin for other changes.",
                    { variant: "error" }
                  );
                }
              },
            });
          }
          if (
            params?.row &&
            canEditLearner(me?.role, me?.id, params.row.ownerUserId ?? null)
          ) {
            items.push(
              {
                label: "Edit",
                onClick: () => {
                  if (params?.row) setSelectedPerson(params.row);
                  setOpenEdit(true);
                },
              },
              {
                label: "Update Status",
                onClick: () => {
                  if (params?.row) setSelectedPerson(params.row);
                  setSetStageOpen(true);
                },
              },
              {
                label: "Set Stage",
                onClick: () => {
                  if (params?.row) setSelectedPerson(params.row);
                  setSetStageOpen(true);
                },
              },
              {
                label: "Promote",
                onClick: () =>
                  params?.row &&
                  router.push(`/admin/learners/${params.row.id}`),
              }
            );
          }
          return <KebabMenu items={items} />;
        },
      },
    ],
    [me?.role, router]
  );

  const copy = getCrmCopy();
  const pageTitle = copy.pageTitle;

  return (
    <>
      {list.isLoading && <LinearProgress />}
      <PageHeader
        title={pageTitle}
        description={`Manage and track all ${copy.plural}.`}
        actions={
          canCreateLearner(me?.role) ? (
            <Button variant="contained" onClick={() => setOpenCreate(true)}>
              {`New ${copy.singularTitle}`}
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
          placeholder={`Search ${copy.plural}`}
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
        {/* Owner Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Owner</InputLabel>
          <Select
            value={ownerUserId || owner}
            label="Owner"
            onChange={(e) => {
              const v = e.target.value as string;
              if (v === "") {
                setOwner("");
                setOwnerUserId("");
                updateURL({ owner: "", ownerUserId: "" });
              } else if (v === "unassigned") {
                setOwner("unassigned");
                setOwnerUserId("");
                updateURL({ owner: "unassigned", ownerUserId: "" });
              } else if (v === "me") {
                const meId = me?.id || "";
                setOwner("");
                setOwnerUserId(meId);
                updateURL({ owner: "", ownerUserId: meId });
              } else {
                setOwner("");
                setOwnerUserId(v);
                updateURL({ owner: "", ownerUserId: v });
              }
            }}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="unassigned">Unassigned</MenuItem>
            <MenuItem value="me">Me</MenuItem>
            {/* TODO: populate users list when available */}
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
                  title={`No ${copy.plural} found${filterText}`}
                  description={
                    activeFilters.length > 0
                      ? "Try adjusting your filters to see more results."
                      : `Get started by adding your first ${copy.singular} to the system.`
                  }
                  actionLabel={
                    isAdmin(me?.role) && activeFilters.length === 0
                      ? `Add your first ${copy.singularTitle}`
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
              `Created ${copy.singular} (not visible under current filters)`,
              {
                variant: "info",
              }
            );
          }
        }}
      />

      {selectedPerson && (
        <>
          <EditLearnerDialog
            open={openEdit}
            onClose={() => {
              setOpenEdit(false);
              setSelectedPerson(null);
            }}
            learner={selectedPerson}
          />
          <EditLearnerDialog
            open={setStageOpen}
            onClose={() => {
              setSetStageOpen(false);
              setSelectedPerson(null);
            }}
            learner={selectedPerson}
          />
        </>
      )}
    </>
  );
}
