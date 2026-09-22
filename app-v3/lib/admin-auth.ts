import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getIamIdentity, hasPermission } from "@/lib/iam";
/**
 * Requires an authenticated user with an active Command Centre identity.
 * Does NOT require the ADMIN permission — any active identity passes.
 * Used by endpoints like GET /api/admin/iam that surface the caller's own
 * role and permissions.
 */
export async function requireIdentity() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server component/API compatibility.
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false as const,
      status: 401,
      error: "Unauthorized.",
    };
  }

  const identity = await getIamIdentity(user.id);

  if (!identity || identity.status !== "ACTIVE") {
    return {
      authorized: false as const,
      status: 403,
      error: "Institutional access is inactive.",
    };
  }

  return {
    authorized: true as const,
    user,
    identity,
  };
}
export async function requireAdmin() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server component/API compatibility.
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false as const,
      status: 401,
      error: "Unauthorized.",
    };
  }

  const identity = await getIamIdentity(user.id);

  if (!identity || identity.status !== "ACTIVE") {
    return {
      authorized: false as const,
      status: 403,
      error: "Institutional access is inactive.",
    };
  }

  if (!hasPermission(identity, "ADMIN")) {
    return {
      authorized: false as const,
      status: 403,
      error: "Administrative permission required.",
    };
  }

  return {
    authorized: true as const,
    user,
    identity,
  };
}
