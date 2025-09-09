"use client";

import { useParams, useRouter } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useMemo, useState } from "react";
import usePerson from "@/api/hooks/usePerson";
import { useTransitions } from "@/api/hooks/useTransitions";
import StatusChip from "@/components/StatusChip";
import Button from "@mui/material/Button";
import { useMe } from "@/api/hooks/useMe";
import { isAdmin, canViewNotes } from "@/utils/rbac";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { useSnackbar } from "notistack";
import { useSettings } from "@/api/hooks/useSettings";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";
import { ApiError } from "@/api/errors";

import { formatDistanceToNow } from "date-fns";
import PersonTransitionDialog from "@/components/PersonTransitionDialog";
import EditLearnerDialog from "@/components/EditLearnerDialog";

import CounselingTab from "@/components/CounselingTab";
import NotesTab from "@/components/NotesTab";

import type { ReactElement } from "react";

export default function LearnerPanel(): ReactElement {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, refetch } = usePerson(params.id);
  const { transitions } = useTransitions(params.id || "");
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { accessToken } = useAuth();

  const { data: me } = useMe();
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [stageUpdating, setStageUpdating] = useState(false);

  const canPromote = useMemo(
    () =>
      isAdmin(me?.role) && data && ["SUSPECT", "LEAD"].includes(data.status),
    [me?.role, data]
  );

  const handleStageChange = async (newStage: string) => {
    if (!data || stageUpdating) return;

    setStageUpdating(true);
    try {
      // Log the PATCH URL/payload in development
      if (process.env.NODE_ENV === "development") {
        console.log("Stage PATCH URL:", `/api/v1/learners/${data.id}/stage`);
        console.log("Stage PATCH payload:", { stage: newStage });
      }

      try {
        // Try the specific stage endpoint first
        await fetchJson(`/api/v1/learners/${data.id}/stage`, {
          method: "PATCH",
          body: { stage: newStage },
          token: accessToken || undefined,
        });
      } catch (error: unknown) {
        // If the specific endpoint doesn't exist (404), fall back to general people PATCH
        if (error instanceof ApiError && error.status === 404) {
          console.log(
            "Stage-specific endpoint not found, using general people PATCH"
          );
          await fetchJson(`/api/v1/people/${data.id}`, {
            method: "PATCH",
            body: { stage: newStage },
            token: accessToken || undefined,
          });
        } else {
          // Handle specific error codes
          if (
            error instanceof ApiError &&
            error.code === "INVALID_STAGE_FOR_STATUS"
          ) {
            enqueueSnackbar(
              error.message || "Invalid stage for current status",
              {
                variant: "error",
              }
            );
            // Reset to server value by refetching
            await refetch();
            return;
          }
          throw error;
        }
      }

      enqueueSnackbar("Stage updated", { variant: "success" });
      await refetch();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update stage";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setStageUpdating(false);
    }
  };

  if (!data) {
    return (
      <Drawer
        anchor="right"
        open
        onClose={() => router.push("/admin/learners")}
        PaperProps={{ sx: { width: 520 } }}
      >
        <Box p={2}>Loading...</Box>
      </Drawer>
    );
  }

  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={() => router.push("/admin/learners")}
        PaperProps={{ sx: { width: 520 } }}
      >
        <Box p={2} display="flex" flexDirection="column" gap={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box fontWeight={600}>
              {data.firstName} {data.lastName}
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <StatusChip status={data.status} />
              {canPromote && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setPromoteOpen(true)}
                >
                  Promote
                </Button>
              )}
              {isAdmin(me?.role) && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
              )}
            </Box>
          </Box>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Profile" />
            <Tab label="Appointments" />
            {canViewNotes(me?.role) && <Tab label="Notes" />}
            <Tab label="Transitions" />
          </Tabs>
          {tab === 0 && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Box>
                <Box
                  fontWeight={600}
                  color="text.secondary"
                  fontSize="0.875rem"
                >
                  Email
                </Box>
                <Box>{data.email || "-"}</Box>
              </Box>
              <Box>
                <Box
                  fontWeight={600}
                  color="text.secondary"
                  fontSize="0.875rem"
                >
                  Phone
                </Box>
                <Box>{data.phone || "-"}</Box>
              </Box>
              <Box>
                <Box
                  fontWeight={600}
                  color="text.secondary"
                  fontSize="0.875rem"
                >
                  LinkedIn
                </Box>
                <Box>
                  {data.linkedinUrl ? (
                    <a
                      href={data.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit" }}
                    >
                      {new URL(data.linkedinUrl).hostname}
                    </a>
                  ) : (
                    "-"
                  )}
                </Box>
              </Box>
              <Box>
                <Box
                  fontWeight={600}
                  color="text.secondary"
                  fontSize="0.875rem"
                >
                  Source
                </Box>
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
                    display: "inline-block",
                  }}
                >
                  {data.source || "Unknown"}
                </Box>
              </Box>
              {isAdmin(me?.role) && (
                <Box>
                  <Box
                    fontWeight={600}
                    color="text.secondary"
                    fontSize="0.875rem"
                    mb={1}
                  >
                    Stage
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Stage</InputLabel>
                    <Select
                      value={data.stage || ""}
                      onChange={(e) => handleStageChange(e.target.value)}
                      disabled={
                        stageUpdating ||
                        !settings.data?.stagesByStatus?.[data.status]
                      }
                      label="Stage"
                    >
                      {settings.data?.stagesByStatus?.[data.status]?.map(
                        (stage) => (
                          <MenuItem key={stage} value={stage}>
                            {stage}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Box>
              )}
              <Box>
                <Box
                  fontWeight={600}
                  color="text.secondary"
                  fontSize="0.875rem"
                >
                  Added
                </Box>
                <Box>
                  {new Date(data.createdAt).toLocaleDateString()} (
                  {formatDistanceToNow(new Date(data.createdAt), {
                    addSuffix: true,
                  })}
                  )
                </Box>
              </Box>
            </Box>
          )}
          {tab === 1 && (
            <CounselingTab
              learnerId={data.id}
              learnerName={`${data.firstName || ""} ${
                data.lastName || ""
              }`.trim()}
              learnerEmail={data.email || ""}
              onSettingsClick={() => router.push("/admin/settings")}
            />
          )}
          {canViewNotes(me?.role) && tab === 2 && (
            <NotesTab learnerId={data.id} />
          )}
          {tab === (canViewNotes(me?.role) ? 3 : 2) && (
            <Box display="flex" flexDirection="column" gap={1}>
              {(transitions.data || []).map((t, i) => (
                <Box
                  key={i}
                  fontSize={14}
                  color="text.secondary"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "rgba(99,102,241,0.05)",
                    border: "1px solid rgba(99,102,241,0.1)",
                  }}
                >
                  <Box component="span" color="text.primary" fontWeight={600}>
                    {t.toStatus.replace("_", " ")}
                  </Box>
                  {" · "}
                  {formatDistanceToNow(new Date(t.createdAt), {
                    addSuffix: true,
                  })}
                  {t.reason && (
                    <>
                      <br />
                      <Box
                        component="span"
                        color="text.secondary"
                        fontSize={12}
                      >
                        Reason: {t.reason}
                      </Box>
                    </>
                  )}
                </Box>
              ))}
              {transitions.isLoading && (
                <Box
                  textAlign="center"
                  py={4}
                  color="text.secondary"
                  fontSize="0.875rem"
                >
                  Loading transitions...
                </Box>
              )}
              {!transitions.isLoading &&
                (!transitions.data || transitions.data.length === 0) && (
                  <Box
                    textAlign="center"
                    py={4}
                    color="text.secondary"
                    fontSize="0.875rem"
                  >
                    No status transitions yet
                  </Box>
                )}
            </Box>
          )}
        </Box>
      </Drawer>

      <PersonTransitionDialog
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        onSuccess={() => {
          // Close the drawer and redirect to learners list after successful promotion
          router.push("/admin/learners");
        }}
        person={data}
      />

      <EditLearnerDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        learner={data}
      />
    </>
  );
}
