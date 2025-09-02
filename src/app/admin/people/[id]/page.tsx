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
import { isAdmin } from "@/utils/rbac";
import { useSettings } from "@/api/hooks/useSettings";
import { formatDistanceToNow } from "date-fns";
import PersonTransitionDialog from "@/components/PersonTransitionDialog";
import EditPersonDialog from "@/components/EditPersonDialog";
import EmptyState from "@/components/EmptyState";

import type { ReactElement } from "react";

export default function PersonPanel(): ReactElement {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data } = usePerson(params.id);
  const { transitions } = useTransitions(params.id || "");
  const { settings } = useSettings();
  const counselingUrl = settings.data?.counselingEmbedUrl || "";
  const { data: me } = useMe();
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState(0);

  const canPromote = useMemo(
    () =>
      isAdmin(me?.role) && data && ["SUSPECT", "LEAD"].includes(data.status),
    [me?.role, data]
  );

  if (!data) {
    return (
      <Drawer
        anchor="right"
        open
        onClose={() => router.push("/admin/people")}
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
        onClose={() => router.push("/admin/people")}
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
            <Tab label="Counseling" />
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
            <Box height={600}>
              {counselingUrl ? (
                <iframe
                  title="Counseling"
                  src={`${counselingUrl}?personId=${
                    data.id
                  }&name=${encodeURIComponent(
                    `${data.firstName || ""} ${data.lastName || ""}`.trim()
                  )}&email=${encodeURIComponent(data.email || "")}`}
                  style={{ border: 0, width: "100%", height: "100%" }}
                />
              ) : (
                <EmptyState
                  title="No Counseling Embed Configured"
                  description="Add a counseling embed URL in Settings to enable this feature."
                  actionLabel="Go to Settings"
                  onAction={() => router.push("/admin/settings")}
                />
              )}
            </Box>
          )}
          {tab === 2 && (
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
          // Close the drawer and redirect to people list after successful promotion
          router.push("/admin/people");
        }}
        person={data}
      />

      <EditPersonDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        person={data}
      />
    </>
  );
}
