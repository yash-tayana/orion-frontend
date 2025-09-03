"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PeopleRedirect(): null {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/learners");
  }, [router]);

  return null;
}
