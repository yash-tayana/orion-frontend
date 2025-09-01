"use client";

import type { ReactElement } from "react";

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
}): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <h3>Something went wrong</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{error.message}</pre>
    </div>
  );
}
