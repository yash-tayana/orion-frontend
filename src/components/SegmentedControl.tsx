"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ReactElement } from "react";

export type Segment = { label: string; value: string };

export default function SegmentedControl({
  value,
  onChange,
  segments,
}: {
  value: string;
  onChange: (v: string) => void;
  segments: Segment[];
}): ReactElement {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, v) => onChange(v ?? "")}
    >
      {segments.map((s) => (
        <ToggleButton key={s.value} value={s.value} sx={{ borderRadius: 2 }}>
          {s.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
