"use client";

import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  TablePagination,
} from "@mui/material";
import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import {
  useUsersList,
  useUpdateUserRole,
  useUserRoleDescriptions,
  type AppUser,
} from "@/api/hooks/useUsers";
import { useMe } from "@/api/hooks/useMe";
import { isSuper } from "@/utils/rbac";
import { useSnackbar } from "notistack";
import { getCrmCopy } from "@/utils/crmCopy";

export default function UsersPage(): ReactElement {
  const router = useRouter();
  const { data: me } = useMe();
  const { enqueueSnackbar } = useSnackbar();
  const copy = getCrmCopy();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const list = useUsersList({ q, page: page + 1, pageSize });
  const updateRole = useUpdateUserRole();
  const roleDescriptionsQuery = useUserRoleDescriptions();
  const rolesList: Array<{ key: string; label: string; description: string }> =
    roleDescriptionsQuery.data && Array.isArray(roleDescriptionsQuery.data)
      ? roleDescriptionsQuery.data
      : [
          {
            key: "SUPER_ADMIN",
            label: "SUPER_ADMIN",
            description: "Full access; can change other users’ roles.",
          },
          {
            key: "ADMIN",
            label: "ADMIN",
            description: "Full data + edit; no role management.",
          },
          {
            key: "SALES",
            label: "SALES",
            description: `See own + unassigned; can claim unassigned; edit only own ${copy.plural}.`,
          },
          {
            key: "COUNSELOR",
            label: "COUNSELOR",
            description: `Read-only across ${copy.plural}; counselors settings view-only.`,
          },
          { key: "USER", label: "USER", description: "Limited access user." },
          {
            key: "MARKETER",
            label: "MARKETER",
            description: "Marketing role.",
          },
          {
            key: "TRAINING_ADMIN",
            label: "TRAINING_ADMIN",
            description: "Training admin role.",
          },
        ];

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    user: AppUser;
    nextRole: AppUser["role"];
    prevRole: AppUser["role"];
  } | null>(null);

  if (!isSuper(me?.role)) {
    // Visual gating only; server also enforces
    return (
      <Box>
        <PageHeader title="Users" />
        <Paper sx={{ p: 2 }}>
          <Typography>You don’t have access to this page.</Typography>
          <Button
            sx={{ mt: 1 }}
            onClick={() => router.push("/admin/dashboard")}
          >
            Go back
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Users" description="Manage user roles." />
      <Box display="flex" gap={2} mb={2}>
        <TextField
          size="small"
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Box>
      <Box display="grid" gridTemplateColumns={{ md: "1fr 320px" }} gap={2}>
        <Paper>
          <Table size="small" aria-label="users-table">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.data?.items?.map((u) => {
                const disabled = u.id === me?.id;
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.displayName || "—"}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                          label="Role"
                          value={u.role}
                          onChange={async (e) => {
                            const nextRole = e.target.value as AppUser["role"];
                            if (nextRole === u.role) return;
                            setConfirmTarget({
                              user: u,
                              nextRole,
                              prevRole: u.role,
                            });
                            setConfirmOpen(true);
                          }}
                          disabled={disabled}
                        >
                          {(
                            [
                              "SUPER_ADMIN",
                              "ADMIN",
                              "SALES",
                              "COUNSELOR",
                              "USER",
                              "MARKETER",
                              "TRAINING_ADMIN",
                            ] as const
                          ).map((r) => (
                            <MenuItem
                              key={r}
                              value={r}
                              disabled={u.id === me?.id && r !== u.role}
                            >
                              {r}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {disabled && (
                        <Tooltip title="You can’t change your own role.">
                          <Typography variant="caption" color="text.secondary">
                            You can’t change your own role
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {u.lastActiveAt
                        ? new Date(u.lastActiveAt).toLocaleString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!list.data?.items?.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography>No users found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={list.data?.total || 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Paper>

        <Card>
          <CardHeader title="Role descriptions" />
          <CardContent>
            {rolesList.map((r) => (
              <Box key={r.key} mb={1.2}>
                <Typography variant="subtitle2">{r.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {r.description}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmTarget
            ? `Change role for ${confirmTarget.user.email}\n${confirmTarget.prevRole} → ${confirmTarget.nextRole}`
            : "Confirm"
        }
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
        onConfirm={async () => {
          if (!confirmTarget) return;
          try {
            await updateRole.mutateAsync({
              id: confirmTarget.user.id,
              role: confirmTarget.nextRole,
            });
            enqueueSnackbar("Role updated", { variant: "success" });
            await list.refetch();
          } catch (e: any) {
            if (e?.code === "CANNOT_CHANGE_SELF_ROLE") {
              enqueueSnackbar("CANNOT_CHANGE_SELF_ROLE", { variant: "error" });
            } else {
              enqueueSnackbar("Failed to update role", { variant: "error" });
            }
          } finally {
            setConfirmOpen(false);
            setConfirmTarget(null);
          }
        }}
      />
    </Box>
  );
}
