import { redirect } from "next/navigation";

export default function AdminIndex(): null {
  redirect("/admin/people");
}
