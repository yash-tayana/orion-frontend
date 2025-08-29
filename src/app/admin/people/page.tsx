"use client";

import { useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useSnackbar } from "notistack";
import DataGridToolbar from "@/components/DataGridToolbar";
import StatusChip from "@/components/StatusChip";
import { isAdmin } from "@/utils/rbac";
import { usePeople } from "@/api/hooks/usePeople";
import { useMe } from "@/api/hooks/useMe";
import { useTransitions } from "@/api/hooks/useTransitions";

export default function PeoplePage(): JSX.Element {
  const { data: me } = useMe();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { list, create } = usePeople({ q, status });
  const { enqueueSnackbar } = useSnackbar();

  const [openCreate, setOpenCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteReason, setPromoteReason] = useState("");

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "firstName", headerName: "First name", flex: 1 },
      { field: "lastName", headerName: "Last name", flex: 1 },
      { field: "email", headerName: "Email", flex: 1.3 },
      { field: "phone", headerName: "Phone", flex: 1 },
      { field: "linkedinUrl", headerName: "LinkedIn", flex: 1 },
      { field: "source", headerName: "Source", width: 120 },
      {
        field: "status",
        headerName: "Status",
        width: 160,
        renderCell: (params) => <StatusChip status={String(params.value)} />,
      },
      { field: "updatedAt", headerName: "Updated", width: 180 },
    ],
    []
  );

  const selected = list.data?.find((p) => p.id === selectedId);
  const { transition } = useTransitions(selectedId || "");

  return (
    <>
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={(list.data || []).map((p) => ({ ...p, id: p.id }))}
          columns={columns}
          loading={list.isLoading}
          disableRowSelectionOnClick
          onRowClick={(p) => setSelectedId(String(p.id))}
          slots={{ toolbar: DataGridToolbar as any }}
          slotProps={{
            toolbar: {
              q,
              status,
              onQ: setQ,
              onStatus: setStatus,
              onCreate: () => setOpenCreate(true),
              disableCreate: !isAdmin(me?.role),
            },
          }}
        />
      </Paper>

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>New Person</DialogTitle>
        <DialogContent sx={{ display: "flex", gap: 2, mt: 1 }}>
          <TextField label="First name" fullWidth size="small" id="firstName" />
          <TextField label="Last name" fullWidth size="small" id="lastName" />
        </DialogContent>
        <DialogContent sx={{ display: "flex", gap: 2 }}>
          <TextField label="Email" fullWidth size="small" id="email" />
          <TextField label="Phone" fullWidth size="small" id="phone" />
        </DialogContent>
        <DialogContent>
          <TextField
            label="LinkedIn URL"
            fullWidth
            size="small"
            id="linkedinUrl"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              const body = {
                firstName:
                  (document.getElementById("firstName") as HTMLInputElement)
                    ?.value || undefined,
                lastName:
                  (document.getElementById("lastName") as HTMLInputElement)
                    ?.value || undefined,
                email:
                  (document.getElementById("email") as HTMLInputElement)
                    ?.value || undefined,
                phone:
                  (document.getElementById("phone") as HTMLInputElement)
                    ?.value || undefined,
                linkedinUrl:
                  (document.getElementById("linkedinUrl") as HTMLInputElement)
                    ?.value || undefined,
              };
              try {
                await create.mutateAsync(body);
                enqueueSnackbar("Person created", { variant: "success" });
                setOpenCreate(false);
              } catch (e: any) {
                enqueueSnackbar(e?.message || "Failed to create person", {
                  variant: "error",
                });
              }
            }}
            disabled={!isAdmin(me?.role)}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        PaperProps={{ sx: { width: 420 } }}
      >
        <Box p={2} display="flex" flexDirection="column" gap={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box fontWeight={600}>
              {selected?.firstName} {selected?.lastName}
            </Box>
            <StatusChip status={selected?.status || ""} />
          </Box>

          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="outlined"
              disabled={!isAdmin(me?.role) || selected?.status !== "SUSPECT"}
              onClick={() => setPromoteOpen(true)}
            >
              Promote to LEAD
            </Button>
          </Box>

          <Box>
            <Box fontSize={13} color="text.secondary">
              Email
            </Box>
            <Box>{selected?.email || "-"}</Box>
          </Box>
          <Box>
            <Box fontSize={13} color="text.secondary">
              Phone
            </Box>
            <Box>{selected?.phone || "-"}</Box>
          </Box>
          <Box>
            <Box fontSize={13} color="text.secondary">
              LinkedIn
            </Box>
            <Box>{selected?.linkedinUrl || "-"}</Box>
          </Box>

          <Box>
            <Box fontWeight={600} mt={2} mb={1}>
              Transitions
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              {(selected?.transitions || []).map((t, i) => (
                <Box key={i} fontSize={14}>
                  {t.createdAt} → {t.toStatus} ({t.reason || "-"})
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Promote to LEAD</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason"
            fullWidth
            size="small"
            value={promoteReason}
            onChange={(e) => setPromoteReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromoteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!selectedId) return;
              try {
                await transition.mutateAsync({
                  toStatus: "LEAD",
                  reason: promoteReason,
                });
                enqueueSnackbar("Promoted to LEAD", { variant: "success" });
                setPromoteOpen(false);
              } catch (e: any) {
                enqueueSnackbar(e?.message || "Failed to promote", {
                  variant: "error",
                });
              }
            }}
            disabled={!isAdmin(me?.role)}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
