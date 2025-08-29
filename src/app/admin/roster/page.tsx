"use client";

import { useCallback } from "react";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useSnackbar } from "notistack";
import { useRoster } from "@/api/hooks/useRoster";
import { downloadBlobCsv } from "@/utils/csv";

export default function RosterPage(): JSX.Element {
  const { list, downloadCsv } = useRoster();
  const { enqueueSnackbar } = useSnackbar();

  const onExport = useCallback(async () => {
    try {
      const blob = await downloadCsv();
      downloadBlobCsv(blob, "roster.csv");
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Failed to export CSV", {
        variant: "error",
      });
    }
  }, [downloadCsv, enqueueSnackbar]);

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={onExport}>
          Export CSV
        </Button>
      </Stack>
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
    </>
  );
}
