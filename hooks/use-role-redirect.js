"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { roleHomePath } from "@/types/roles";

export function useRoleRedirect(role) {
  const router = useRouter();

  useEffect(() => {
    if (role && roleHomePath[role]) {
      router.replace(roleHomePath[role]);
    }
  }, [role, router]);
}
