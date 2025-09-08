"use client";

import { useCallback, useState, type ReactElement } from "react";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useSnackbar } from "notistack";
import { useRoster } from "@/api/hooks/useRoster";
import { useSettings } from "@/api/hooks/useSettings";
import { downloadBlobCsv } from "@/utils/csv";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function RosterPage(): ReactElement {
  const { list } = useRoster();
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const onExport = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/roster?format=csv", {
        headers: {
          Accept: "text/csv",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to download CSV");
      }

      const blob = await response.blob();
      downloadBlobCsv(blob, "candidate-free-roster.csv");
      enqueueSnackbar("Roster CSV downloaded", { variant: "success" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to export CSV";
      enqueueSnackbar(message, {
        variant: "error",
      });
    }
  }, [enqueueSnackbar]);

  return (
    <>
      <PageHeader
        title="Candidate-Free Roster"
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={onExport}>
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={async () => {
                try {
                  const meetingLink = settings.data?.meetingLink || "";
                  if (!meetingLink) {
                    enqueueSnackbar("No meeting link configured in settings", {
                      variant: "error",
                    });
                    return;
                  }
                  await navigator.clipboard.writeText(meetingLink);
                  enqueueSnackbar("Meeting link copied", {
                    variant: "success",
                  });
                } catch {
                  enqueueSnackbar("Failed to copy meeting link", {
                    variant: "error",
                  });
                }
              }}
            >
              Copy Meeting Link
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Copy Discord Template
            </Button>
          </Stack>
        }
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box p={2} maxWidth={360}>
          <Typography variant="subtitle2" mb={1}>
            Preview
          </Typography>
          <Box component="pre" m={0} sx={{ whiteSpace: "pre-wrap" }}>
            {`Hi there!\nJoin our coaching call using the link above.\nPlease be on time and keep your questions ready.`}
          </Box>
          <Stack direction="row" justifyContent="flex-end" mt={1} spacing={1}>
            <Button size="small" onClick={() => setAnchorEl(null)}>
              Close
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={async () => {
                const template = `Hi there!\nJoin our coaching call using the link above.\nPlease be on time and keep your questions ready.`;
                try {
                  await navigator.clipboard.writeText(template);
                  enqueueSnackbar("Discord template copied", {
                    variant: "success",
                  });
                  setAnchorEl(null);
                } catch {
                  enqueueSnackbar("Failed to copy template", {
                    variant: "error",
                  });
                }
              }}
            >
              Copy
            </Button>
          </Stack>
        </Box>
      </Popover>
      {list.isLoading ? (
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={32} variant="rounded" />
            ))}
          </Stack>
        </Paper>
      ) : (list.data || []).length === 0 ? (
        <EmptyState
          title="No candidate-free people"
          description="When people get promoted to candidate-free, they will appear here."
        />
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(list.data || []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.firstName || ""} {p.lastName || ""}
                    </TableCell>
                    <TableCell>{p.email || "-"}</TableCell>
                    <TableCell>{p.phone || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );
}
