"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Typography,
} from "@mui/material";
import { useCounselors } from "@/api/hooks/useCounselors";
import EmptyState from "@/components/EmptyState";
import type { ReactElement } from "react";

interface CounselingTabProps {
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  onSettingsClick: () => void;
}

export default function CounselingTab({
  learnerId,
  learnerName,
  learnerEmail,
  onSettingsClick,
}: CounselingTabProps): ReactElement {
  const { counselors } = useCounselors("active");
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>("");

  // Set default counselor when data loads
  useEffect(() => {
    if (counselors.data && counselors.data.length > 0 && !selectedCounselorId) {
      setSelectedCounselorId(counselors.data[0].id);
    }
  }, [counselors.data, selectedCounselorId]);

  const selectedCounselor = counselors.data?.find(
    (c) => c.id === selectedCounselorId
  );

  if (counselors.isLoading) {
    return (
      <Box height={600} display="flex" flexDirection="column" gap={2}>
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={560} />
      </Box>
    );
  }

  if (!counselors.data || counselors.data.length === 0) {
    return (
      <Box height={600}>
        <EmptyState
          title="No Active Counselors"
          description="Add counselors in Settings to enable counseling sessions."
          actionLabel="Go to Settings"
          onAction={onSettingsClick}
        />
      </Box>
    );
  }

  const iframeUrl = selectedCounselor
    ? `${
        selectedCounselor.embedUrl
      }?personId=${learnerId}&name=${encodeURIComponent(
        learnerName
      )}&email=${encodeURIComponent(learnerEmail)}`
    : "";

  return (
    <Box height={600} display="flex" flexDirection="column" gap={2}>
      {counselors.data.length > 1 && (
        <FormControl fullWidth>
          <InputLabel>Counselor</InputLabel>
          <Select
            value={selectedCounselorId}
            onChange={(e) => setSelectedCounselorId(e.target.value)}
            label="Counselor"
          >
            {counselors.data.map((counselor) => (
              <MenuItem key={counselor.id} value={counselor.id}>
                {counselor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedCounselor && (
        <>
          <Typography variant="body2" color="text.secondary">
            Using: {selectedCounselor.name}
          </Typography>
          <Box flex={1} position="relative">
            <iframe
              title="Counseling Session"
              src={iframeUrl}
              style={{
                border: 0,
                width: "100%",
                height: "100%",
                borderRadius: 8,
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
