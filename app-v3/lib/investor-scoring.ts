export type InvestorScoreBand =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "VERY_HIGH";

export interface InvestorScoringInput {
  lifecycleState: string | null;
  relationshipStage: string | null;

  expectedInvestmentInr: number;
  probabilityPercent: number;

  daysSinceLastContact: number | null;
  activityCount: number;

  openActionCount: number;
  overdueActionCount: number;

  riskLevel: string | null;

  kycCompleted: boolean;
  ndaSigned: boolean;
}

export interface InvestorScoreBreakdown {
  lifecycle: number;
  relationship: number;
  capital: number;
  probability: number;
  engagement: number;
  actionHealth: number;
  risk: number;
  readiness: number;
}

export interface InvestorScoreResult {
  score: number;
  band: InvestorScoreBand;
  breakdown: InvestorScoreBreakdown;
  reasons: string[];
}

const LIFECYCLE_SCORES: Record<string, number> = {
  PROSPECT: 5,
  APPLICANT: 10,
  REGISTERED: 15,
  VERIFIED: 20,
  QUALIFIED: 25,
  ACTIVE: 30,
  COMMITTED: 35,
  INVESTED: 40,
  INACTIVE: 5,
  DISQUALIFIED: 0,
};

const RELATIONSHIP_SCORES: Record<string, number> = {
  PROSPECT: 0,
  CONTACTED: 4,
  INTERESTED: 8,
  NDA: 10,
  DUE_DILIGENCE: 12,
  COMMITMENT: 14,
  INVESTED: 15,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function scoreCapital(expectedInvestmentInr: number): number {
  if (expectedInvestmentInr >= 1000000) return 15;
  if (expectedInvestmentInr >= 500000) return 12;
  if (expectedInvestmentInr >= 250000) return 9;
  if (expectedInvestmentInr >= 100000) return 6;
  if (expectedInvestmentInr >= 50000) return 3;
  return 0;
}

function scoreEngagement(
  daysSinceLastContact: number | null,
  activityCount: number,
): number {
  let score = 0;

  if (activityCount >= 10) score += 5;
  else if (activityCount >= 5) score += 4;
  else if (activityCount >= 2) score += 2;
  else if (activityCount >= 1) score += 1;

  if (daysSinceLastContact !== null) {
    if (daysSinceLastContact <= 3) score += 5;
    else if (daysSinceLastContact <= 7) score += 4;
    else if (daysSinceLastContact <= 14) score += 2;
    else if (daysSinceLastContact <= 30) score += 1;
  }

  return clamp(score, 0, 10);
}

function scoreActionHealth(
  openActionCount: number,
  overdueActionCount: number,
): number {
  if (overdueActionCount > 0) return 0;
  if (openActionCount === 0) return 3;
  if (openActionCount <= 2) return 5;
  if (openActionCount <= 4) return 4;
  return 2;
}

function scoreRisk(riskLevel: string | null): number {
  switch (riskLevel) {
    case "CRITICAL":
      return 0;
    case "HIGH":
      return 2;
    case "MEDIUM":
      return 5;
    case "LOW":
    default:
      return 7;
  }
}

function scoreReadiness(
  kycCompleted: boolean,
  ndaSigned: boolean,
): number {
  if (kycCompleted && ndaSigned) return 8;
  if (kycCompleted || ndaSigned) return 4;
  return 0;
}

function getBand(score: number): InvestorScoreBand {
  if (score >= 75) return "VERY_HIGH";
  if (score >= 55) return "HIGH";
  if (score >= 30) return "MODERATE";
  return "LOW";
}

export function calculateInvestorScore(
  input: InvestorScoringInput,
): InvestorScoreResult {
  const lifecycle = clamp(
    LIFECYCLE_SCORES[input.lifecycleState ?? ""] ?? 0,
    0,
    40,
  );

  const relationship = clamp(
    RELATIONSHIP_SCORES[input.relationshipStage ?? ""] ?? 0,
    0,
    15,
  );

  const capital = scoreCapital(input.expectedInvestmentInr);

  const probability = clamp(
    Math.round((clamp(input.probabilityPercent, 0, 100) / 100) * 10),
    0,
    10,
  );

  const engagement = scoreEngagement(
    input.daysSinceLastContact,
    input.activityCount,
  );

  const actionHealth = scoreActionHealth(
    input.openActionCount,
    input.overdueActionCount,
  );

  const risk = scoreRisk(input.riskLevel);

  const readiness = scoreReadiness(
    input.kycCompleted,
    input.ndaSigned,
  );

  const rawScore =
    lifecycle +
    relationship +
    capital +
    probability +
    engagement +
    actionHealth +
    risk +
    readiness;

  const score = clamp(rawScore, 0, 100);
  const band = getBand(score);

  const reasons: string[] = [];

  if (lifecycle >= 30) {
    reasons.push("Investor is in an advanced lifecycle state.");
  }

  if (relationship >= 10) {
    reasons.push("Investor relationship is in an advanced stage.");
  }

  if (capital >= 9) {
    reasons.push("Investor has meaningful expected investment value.");
  }

  if (probability >= 7) {
    reasons.push("Investment probability is relatively strong.");
  }

  if (engagement >= 7) {
    reasons.push("Recent CRM engagement is strong.");
  }

  if (input.overdueActionCount > 0) {
    reasons.push("Investor has overdue CRM actions.");
  }

  if (input.riskLevel === "HIGH" || input.riskLevel === "CRITICAL") {
    reasons.push("Investor carries elevated CRM risk.");
  }

  if (input.kycCompleted && input.ndaSigned) {
    reasons.push("KYC and NDA readiness requirements are complete.");
  }

  return {
    score,
    band,
    breakdown: {
      lifecycle,
      relationship,
      capital,
      probability,
      engagement,
      actionHealth,
      risk,
      readiness,
    },
    reasons,
  };
}
