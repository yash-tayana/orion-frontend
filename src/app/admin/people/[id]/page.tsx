"use client";

import { useParams, useRouter } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useState } from "react";
import usePerson from "@/api/hooks/usePerson";
import StatusChip from "@/components/StatusChip";

export default function PersonPanel(): JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data } = usePerson(params.id);
  const [tab, setTab] = useState(0);

  return (
    <Drawer
      anchor="right"
      open
      onClose={() => router.push("/admin/people")}
      PaperProps={{ sx: { width: 520 } }}
    >
      <Box p={2} display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box fontWeight={600}>
            {data?.firstName} {data?.lastName}
          </Box>
          <StatusChip status={data?.status || ""} />
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Profile" />
          <Tab label="Counseling" />
          <Tab label="Transitions" />
        </Tabs>
        {tab === 0 && (
          <Box>
            <Box>Email: {data?.email || "-"}</Box>
            <Box>Phone: {data?.phone || "-"}</Box>
            <Box>LinkedIn: {data?.linkedinUrl || "-"}</Box>
          </Box>
        )}
        {tab === 1 && (
          <Box>
            {/* Placeholder: get counseling embed url from settings in future */}
            <Box>Open counseling provider in a new tab.</Box>
          </Box>
        )}
        {tab === 2 && (
          <Box display="flex" flexDirection="column" gap={1}>
            {(data?.transitions || []).map((t, i) => (
              <Box key={i} fontSize={14}>
                {t.createdAt} → {t.toStatus} ({t.reason || "-"})
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
