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
import type { ReactElement } from "react";

export default function DashboardPage(): ReactElement {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
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

  // Allow universal view access: no redirect for non-admins

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

  // Hide admin-only actions via conditional checks below; view is allowed for all roles

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

  const renderSourcesChart = () => {
    if (!metrics?.topSources || metrics.topSources.length === 0) {
      return (
        <EmptyState
          title="No source data"
          description="Source metrics will appear here once learners are added."
          actionLabel="View Learners"
          onAction={() => router.push("/admin/learners")}
        />
      );
    }

    const maxCount = Math.max(...metrics.topSources.map((s) => s.count));

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Top Sources
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          {metrics.topSources.map((source, index) => (
            <Box key={index} display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" sx={{ minWidth: 120 }}>
                {source.source}
              </Typography>
              <Box flex={1} position="relative">
                <Box
                  sx={{
                    height: 20,
                    bgcolor: "primary.main",
                    borderRadius: 1,
                    width: `${(source.count / maxCount) * 100}%`,
                    transition: "width 0.3s ease",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                >
                  {source.count}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box>
        <PageHeader title="Dashboard" description="At a glance" />
        <Box display="flex" flexDirection="column" gap={3}>
          {/* KPI Cards Skeleton */}
          <Box display="flex" gap={2} flexWrap="wrap">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={200}
                height={120}
              />
            ))}
          </Box>

          {/* Chart Skeleton */}
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Box mt={2}>
              {[1, 2, 3].map((i) => (
                <Box key={i} display="flex" alignItems="center" gap={2} mb={1}>
                  <Skeleton variant="text" width={120} height={20} />
                  <Skeleton variant="rectangular" width="100%" height={20} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Dashboard" description="At a glance" />

      <Box display="flex" flexDirection="column" gap={3}>
        {/* KPI Cards */}
        <Box display="flex" gap={2} flexWrap="wrap">
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

        {/* Sources Chart */}
        <Paper sx={{ p: 3, bgcolor: "rgba(148,163,184,0.05)" }}>
          {renderSourcesChart()}
        </Paper>

        <Card>
          <CardHeader
            title="Learner Owner (daily)"
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
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  Last 30 days · {tz}
                </Typography>
              </Box>
            }
          />
          <CardContent>
            {series.isLoading ? (
              <Typography variant="body2">Loading…</Typography>
            ) : !series.data || series.data.series.length === 0 ? (
              <Typography variant="body2">No data</Typography>
            ) : (
              <Table size="small" aria-label="learner-owner-daily">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {series.data.series.map((row, idx) => {
                    const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(row.date)
                      ? row.date
                      : new Date(row.date).toISOString().slice(0, 10);
                    const ownerLabel = row.owner;
                    return (
                      <TableRow
                        key={`${row.date}-${row.owner ?? "unassigned"}-${idx}`}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          const isUnassigned = ownerLabel === "Unassigned";
                          const qp = isUnassigned
                            ? `owner=unassigned`
                            : `owner=${encodeURIComponent(ownerLabel)}`;
                          router.push(
                            `/admin/learners?status=${ownerStatus}&${qp}`
                          );
                        }}
                      >
                        <TableCell>{dateLabel}</TableCell>
                        <TableCell title={ownerLabel}>{ownerLabel}</TableCell>
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
  );
}
