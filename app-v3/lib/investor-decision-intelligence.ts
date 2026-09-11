export type DecisionPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type DecisionRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface InvestorDecisionIntelligence {
  recommendedAction: string | null;
  recommendationReason: string | null;

  priority: DecisionPriority;
  riskLevel: DecisionRiskLevel;
  attentionReason: string | null;

  relationshipHealth: string | null;
  daysSinceLastContact: number | null;
  activityCount: number;

  expectedInvestmentInr: number;
  weightedInvestmentInr: number;
  probabilityPercent: number;

  obligations: string[];
  signals: string[];
}
