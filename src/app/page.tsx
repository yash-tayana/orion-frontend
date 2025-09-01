import { redirect } from "next/navigation";

export default function Home(): null {
  // For now, redirect to admin people page
  // The RequireAuth component will handle redirecting to login if not authenticated
  redirect("/admin/people");
}
