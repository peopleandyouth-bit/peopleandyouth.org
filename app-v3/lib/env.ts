// lib/env.ts
//
// Phase 12C — Environment variable contract.
//
// Every env var referenced anywhere in the application is declared here
// with a classification: REQUIRED (fails the build if missing),
// OPTIONAL (warns only), or PUBLIC (must be prefixed NEXT_PUBLIC_).
//
// The contract is enforced at server startup by instrumentation.ts
// (see app-v3/instrumentation.ts). This makes a missing variable fail
// immediately at boot rather than silently at first request.

export const REQUIRED_PUBLIC = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export const REQUIRED_SERVER = [
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export const OPTIONAL_SERVER = [
  "CRON_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
] as const;

export type RequiredPublicVar = (typeof REQUIRED_PUBLIC)[number];
export type RequiredServerVar = (typeof REQUIRED_SERVER)[number];
export type OptionalServerVar = (typeof OPTIONAL_SERVER)[number];

export interface EnvValidationResult {
  ok: boolean;
  missing_required: string[];
  missing_optional: string[];
  warnings: string[];
}

/**
 * Inspect process.env against the declared contract. Does not throw.
 * Returns a structured report so the caller can decide the response.
 */
export function validateEnvironment(): EnvValidationResult {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  const warnings: string[] = [];

  for (const name of REQUIRED_PUBLIC) {
    if (!process.env[name]) missingRequired.push(name);
  }

  for (const name of REQUIRED_SERVER) {
    if (!process.env[name]) missingRequired.push(name);
  }

  for (const name of OPTIONAL_SERVER) {
    if (!process.env[name]) missingOptional.push(name);
  }

  // Sanity: no NEXT_PUBLIC_ var should look like a secret
  const suspiciousPrefixes = [
    "SUPABASE_SERVICE",
    "RESEND",
    "RAZORPAY",
    "CRON",
    "ADMIN",
    "SECRET",
  ];

  const publicVars = Object.keys(process.env).filter((name) =>
    name.startsWith("NEXT_PUBLIC_")
  );

  for (const name of publicVars) {
    for (const prefix of suspiciousPrefixes) {
      if (name.includes(prefix)) {
        warnings.push(
          `Potential secret leak: public env var ${name} contains a sensitive keyword.`
        );
        break;
      }
    }
  }

  return {
    ok: missingRequired.length === 0,
    missing_required: missingRequired,
    missing_optional: missingOptional,
    warnings,
  };
}