import Chip from "@mui/material/Chip";

export default function StatusChip({
  status,
}: {
  status: string;
}): JSX.Element {
  const color =
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
      : "warning";
  return (
    <Chip
      size="small"
      label={status.replace("_", " ")}
      color={color as any}
      variant="outlined"
    />
  );
}
