import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { hasPermission, type Permission } from "@/lib/iam";

export async function requirePermission(permission: Permission) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return auth;
  }

  if (!hasPermission(auth.identity, permission)) {
    return {
      authorized: false as const,
      status: 403,
      error: `Permission required: ${permission}.`,
    };
  }

  return auth;
}
