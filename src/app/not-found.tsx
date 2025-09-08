import type { ReactElement } from "react";

export default function NotFound(): ReactElement {
  return (
    <div style={{ padding: 24 }}>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}
