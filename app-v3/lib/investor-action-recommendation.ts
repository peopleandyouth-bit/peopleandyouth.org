export type InvestorActionType =
  | "FOLLOW_UP"
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "SEND_DOCUMENT"
  | "REQUEST_INFORMATION"
  | "COMPLETE_KYC"
  | "COMPLETE_NDA"
  | "ADVANCE_DUE_DILIGENCE"
  | "ADVANCE_COMMITMENT"
  | "RE_ENGAGE"
  | "MAINTAIN_RELATIONSHIP";

export type InvestorActionUrgency =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface InvestorActionRecommendation {
  actionType: InvestorActionType;
  urgency: InvestorActionUrgency;
  title: string;
  reason: string;
  source: string;
  dueWithinHours: number | null;
}

export interface InvestorActionRecommendationInput {
  recommendedAction: string | null;
  decisionPriority: InvestorActionUrgency;

  riskLevel: InvestorActionUrgency;

  lifecycleState: string | null;
  relationshipStage: string | null;

  openActionCount: number;
  overdueActionCount: number;

  kycCompleted: boolean;
  ndaSigned: boolean;

  investorScore: number;
  investorScoreBand: string;
}

const ACTION_MAP: Record<string, InvestorActionType> = {
  FOLLOW_UP: "FOLLOW_UP",
  COMPLETE_KYC: "COMPLETE_KYC",
  COMPLETE_NDA: "COMPLETE_NDA",
  PERSONAL_OUTREACH: "CALL",
  ADVANCE_COMMITMENT: "ADVANCE_COMMITMENT",
  ADVANCE_DUE_DILIGENCE: "ADVANCE_DUE_DILIGENCE",
  SCHEDULE_MEETING: "MEETING",
  EXECUTE_OPEN_ACTION: "FOLLOW_UP",
  RE_ENGAGE: "RE_ENGAGE",
  MAINTAIN_RELATIONSHIP: "MAINTAIN_RELATIONSHIP",
};

function normalizeUrgency(
  priority: InvestorActionUrgency,
  riskLevel: InvestorActionUrgency,
): InvestorActionUrgency {
  const rank: Record<InvestorActionUrgency, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  return rank[riskLevel] > rank[priority] ? riskLevel : priority;
}

function titleForAction(actionType: InvestorActionType): string {
  switch (actionType) {
    case "FOLLOW_UP":
      return "Follow up with investor";
    case "CALL":
      return "Make personal outreach";
    case "EMAIL":
      return "Send investor email";
    case "MEETING":
      return "Schedule investor meeting";
    case "SEND_DOCUMENT":
      return "Send requested document";
    case "REQUEST_INFORMATION":
      return "Request investor information";
    case "COMPLETE_KYC":
      return "Complete KYC";
    case "COMPLETE_NDA":
      return "Complete NDA";
    case "ADVANCE_DUE_DILIGENCE":
      return "Advance due diligence";
    case "ADVANCE_COMMITMENT":
      return "Advance investment commitment";
    case "RE_ENGAGE":
      return "Re-engage investor";
    case "MAINTAIN_RELATIONSHIP":
      return "Maintain investor relationship";
    default:
      return "Take recommended CRM action";
  }
}

function dueWindow(
  urgency: InvestorActionUrgency,
): number | null {
  switch (urgency) {
    case "CRITICAL":
      return 4;
    case "HIGH":
      return 24;
    case "MEDIUM":
      return 72;
    case "LOW":
      return 168;
    default:
      return null;
  }
}

export function buildInvestorActionRecommendation(
  input: InvestorActionRecommendationInput,
): InvestorActionRecommendation {
  let actionType: InvestorActionType =
    ACTION_MAP[input.recommendedAction ?? ""] ??
    "MAINTAIN_RELATIONSHIP";

  let urgency = normalizeUrgency(
    input.decisionPriority,
    input.riskLevel,
  );

  let reason =
    "Maintain the relationship while monitoring CRM signals.";

  if (input.overdueActionCount > 0) {
    actionType = "FOLLOW_UP";
    urgency =
      input.riskLevel === "CRITICAL"
        ? "CRITICAL"
        : "HIGH";
    reason =
      "The investor has overdue CRM actions requiring follow-up.";
  } else if (!input.kycCompleted) {
    actionType = "COMPLETE_KYC";
    urgency = urgency === "LOW" ? "MEDIUM" : urgency;
    reason =
      "KYC is incomplete and should be resolved before progressing further.";
  } else if (!input.ndaSigned) {
    actionType = "COMPLETE_NDA";
    urgency = urgency === "LOW" ? "MEDIUM" : urgency;
    reason =
      "NDA is incomplete and may block secure information sharing.";
  } else if (input.recommendedAction) {
    reason =
      `Decision intelligence recommends: ${input.recommendedAction}.`;
  } else if (input.openActionCount > 0) {
    actionType = "FOLLOW_UP";
    urgency = urgency === "LOW" ? "MEDIUM" : urgency;
    reason =
      "Open CRM actions remain and should be progressed.";
  } else if (
    input.investorScore >= 75 &&
    input.investorScoreBand === "VERY_HIGH"
  ) {
    actionType = "MEETING";
    urgency = urgency === "LOW" ? "MEDIUM" : urgency;
    reason =
      "The investor has very high strategic CRM score and merits active engagement.";
  }

  return {
    actionType,
    urgency,
    title: titleForAction(actionType),
    reason,
    source: "DECISION_INTELLIGENCE",
    dueWithinHours: dueWindow(urgency),
  };
}
