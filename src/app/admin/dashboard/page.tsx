"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Chip,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import { useMe } from "@/api/hooks/useMe";
import { useMetricsSummary } from "@/api/hooks/useMetricsSummary";
import { isAdmin } from "@/utils/rbac";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { useMetricsLeadOwners } from "@/api/hooks/useMetricsLeadOwners";
import { isSales } from "@/utils/rbac";
import { brightColors } from "@/utils/brightColors";
import { PieChart } from "@mui/x-charts/PieChart";
import type { ReactElement } from "react";

export default function DashboardPage(): ReactElement {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { data: me } = useMe();
  const { data: metrics, isLoading, error, refetch } = useMetricsSummary();
  const [ownerStatus, setOwnerStatus] = useState("LEAD");
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );
  const now = useMemo(() => new Date(), []);
  const start = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  }, [now]);
  const end = useMemo(() => now.toISOString(), [now]);
  const { series } = useMetricsLeadOwners({
    status: ownerStatus,
    start,
    end,
    granularity: "day",
    tz,
    ownerUserId: isSales(me?.role) ? me?.id : undefined,
  });

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("Lead owners data:", {
        isLoading: series.isLoading,
        hasData: !!series.data,
        dataLength: series.data?.length,
        sample: series.data?.slice(0, 2),
      });
    }
  }, [series.data, series.isLoading]);

  // Handle errors
  useEffect(() => {
    if (error) {
      enqueueSnackbar("Failed to load dashboard data", {
        variant: "error",
        action: (
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        ),
      });
    }
  }, [error, enqueueSnackbar, refetch]);

  const totalLearners = metrics
    ? Object.values(metrics.countsByStatus).reduce(
        (sum, count) => sum + count,
        0
      )
    : 0;

  const handleCardClick = (status?: string) => {
    const url = status ? `/admin/learners?status=${status}` : "/admin/learners";
    router.push(url);
  };

  const renderTopSourcesChart = () => {
    if (!metrics?.topSources || metrics.topSources.length === 0) {
      return (
        <Typography color="text.secondary">
          No data for selected range.
        </Typography>
      );
    }

    const sources = metrics.topSources ?? [];
    const colors = brightColors(sources.length);

    return (
      <PieChart
        height={220}
        series={[
          {
            data: sources.map((s, idx) => ({
              id: idx,
              value: s.count,
              label: s.source,
            })),
            innerRadius: 40,
            paddingAngle: 1,
            cornerRadius: 3,
            highlightScope: { faded: "global", highlighted: "item" },
            faded: {
              innerRadius: 40,
              additionalRadius: -3,
              color: "rgba(0,0,0,0.06)",
            },
          },
        ]}
        colors={colors}
        slotProps={{
          legend: {
            direction: "column",
            position: { vertical: "middle", horizontal: "right" },
            itemMarkWidth: 10,
            itemMarkHeight: 10,
            labelStyle: { fontSize: 14 },
            padding: 50,
          },
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <Box>
        <PageHeader title="Dashboard" description="At a glance" />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "5fr 7fr" },
            gap: 6,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      xl: "repeat(2, 1fr)",
                    },
                    gap: 6,
                  }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={84} />
                  ))}
                </Box>
              </Box>
              <Box>
                <Skeleton variant="rectangular" height={280} />
              </Box>
            </Box>
          </Box>
          <Box>
            <Skeleton variant="rectangular" height={280 + 3 + 2 * 120} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Dashboard" description="At a glance" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "5fr 7fr" },
          gap: 6,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              {/* 4 KPI cards in a Grid (2x2 on md, 1x4 on sm) */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    xl: "repeat(2, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <StatCard
                    title="Total Learners"
                    value={totalLearners}
                    subtext="All statuses"
                    onClick={() => handleCardClick()}
                    clickable
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <StatCard
                    title="Leads"
                    value={metrics?.countsByStatus.LEAD || 0}
                    subtext="Active prospects"
                    onClick={() => handleCardClick("LEAD")}
                    clickable
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <StatCard
                    title="Candidate-Free"
                    value={metrics?.countsByStatus.CANDIDATE_FREE || 0}
                    subtext="Ready to start"
                    onClick={() => handleCardClick("CANDIDATE_FREE")}
                    clickable
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <StatCard
                    title="Promotions (7d)"
                    value={metrics?.promotionsLast7d || 0}
                    subtext="in last 7 days"
                    onClick={() => handleCardClick()}
                    clickable
                  />
                </motion.div>
              </Box>
            </Box>
            <Box>
              <Card sx={{ height: 320 }}>
                <CardHeader title="Top Sources" />
                <CardContent sx={{ p: 2 }}>
                  {renderTopSourcesChart()}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        <Box>
          <Card sx={{ height: 320 + 3 + 2 * 120 }}>
            <CardHeader
              title="Learner Owner"
              action={
                <Box display="flex" alignItems="center" gap={2} pr={2}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={ownerStatus}
                      onChange={(e) => setOwnerStatus(e.target.value)}
                    >
                      <MenuItem value="LEAD">LEAD</MenuItem>
                      <MenuItem value="SUSPECT">SUSPECT</MenuItem>
                      <MenuItem value="CANDIDATE_FREE">CANDIDATE_FREE</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">
                    Last 30 days · {tz}
                  </Typography>
                </Box>
              }
            />
            <CardContent sx={{ p: 0, height: "100%", overflow: "auto" }}>
              {series.isLoading ? (
                <Box p={2}>
                  <Typography variant="body2">Loading…</Typography>
                </Box>
              ) : !series.data || series.data.length === 0 ? (
                <Box p={2}>
                  <Typography variant="body2">No data</Typography>
                </Box>
              ) : (
                <Table size="small" aria-label="learner-owner-daily">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell sx={{ width: "50%" }}>Owner</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(series.data ?? []).map((row, idx) => {
                      const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(row.date)
                        ? row.date
                        : new Date(row.date).toISOString().slice(0, 10);
                      const ownerLabel =
                        row.ownerDisplayName?.trim() || "Unassigned";
                      return (
                        <TableRow
                          key={`${row.date}-${
                            row.ownerId ?? "unassigned"
                          }-${idx}`}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => {
                            const isUnassigned = !row.ownerId;
                            const qp = isUnassigned
                              ? `owner=unassigned`
                              : `owner=${encodeURIComponent(ownerLabel)}`;
                            router.push(
                              `/admin/learners?status=${ownerStatus}&${qp}`
                            );
                          }}
                        >
                          <TableCell>{dateLabel}</TableCell>
                          <TableCell title={ownerLabel}>
                            <Chip
                              label={ownerLabel}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">{row.count}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
