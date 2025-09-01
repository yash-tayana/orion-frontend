import type { ReactElement } from "react";
import Chip from "@mui/material/Chip";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export default function StatusChip({
  status,
}: {
  status: string;
}): ReactElement {
  const color: ChipColor =
    status === "SUSPECT"
      ? "default"
      : status === "LEAD"
      ? "info"
      : status === "CANDIDATE_FREE"
      ? "success"
      : status === "CANDIDATE_PAID"
      ? "primary"
      : status === "ALUMNI"
      ? "secondary"
      : status === "DISCONTINUED"
      ? "error"
      : "warning";
  return (
    <Chip
      size="small"
      label={status.replaceAll("_", " ")}
      color={color}
      variant="outlined"
    />
  );
}
