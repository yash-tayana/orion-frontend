"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PeopleIdRedirect(): null {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      router.replace(`/admin/learners/${params.id}`);
    }
  }, [router, params.id]);

  return null;
}
