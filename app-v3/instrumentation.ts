// instrumentation.ts
//
// Phase 12C — Runtime environment validation.
//
// Next.js calls register() once when the server process starts,
// before any route handler executes. We use this hook to verify the
// environment contract declared in lib/env.ts so that missing
// variables fail fast at boot rather than silently at first request.
//
// This file lives at the app-v3 root (project root of the Next.js
// app), which is where Next.js expects instrumentation.ts.

export async function register() {
  // Only validate in the Node.js runtime. Edge runtime does not
  // have access to all server-side environment variables and does
  // not need this check.
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { validateEnvironment } = await import("./lib/env");
  const result = validateEnvironment();

  if (!result.ok) {
    const message = [
      "",
      "═══════════════════════════════════════════════════════════════",
      "  ENVIRONMENT CONFIGURATION FAILURE",
      "═══════════════════════════════════════════════════════════════",
      `  Missing required variables: ${result.missing_required.join(", ")}`,
      "",
      "  The server cannot start without these. Add them in Vercel:",
      "    Project → Settings → Environment Variables → Add New",
      "",
      "  Then redeploy.",
      "═══════════════════════════════════════════════════════════════",
      "",
    ].join("\n");

    console.error(message);

    // Fail hard in production so the deployment is marked as failed
    // rather than serving broken pages.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required env vars: ${result.missing_required.join(
          ", "
        )}`
      );
    }
  }

  if (result.missing_optional.length > 0) {
    console.warn(
      `[ENV] Optional variables not set (features will degrade gracefully): ${result.missing_optional.join(
        ", "
      )}`
    );
  }

  for (const warning of result.warnings) {
    console.warn(`[ENV] ${warning}`);
  }

  console.log(
    "[ENV] Environment validation passed. All required variables present."
  );
}