export type CrmTimelineStatus =
  | "OPEN"
  | "COMPLETED"
  | "CANCELLED";

export interface InvestorCrmTimelineItem {
  id: string;
  investorId: string;

  activityType: string;
  subject: string | null;
  details: string | null;

  occurredAt: string;
  dueAt: string | null;
  status: CrmTimelineStatus;

  assignedAdmin: string | null;
  createdBy: string | null;

  createdAt: string;
  updatedAt: string;
}

export function normalizeCrmTimelineItem(
  activity: Record<string, unknown>,
): InvestorCrmTimelineItem {
  const status =
    activity.status === "OPEN" ||
    activity.status === "CANCELLED"
      ? activity.status
      : "COMPLETED";

  return {
    id: String(activity.id),
    investorId: String(activity.investor_id),

    activityType: String(activity.activity_type),
    subject:
      typeof activity.subject === "string"
        ? activity.subject
        : null,
    details:
      typeof activity.details === "string"
        ? activity.details
        : null,

    occurredAt: String(activity.occurred_at),
    dueAt:
      typeof activity.due_at === "string"
        ? activity.due_at
        : null,
    status,

    assignedAdmin:
      typeof activity.assigned_admin === "string"
        ? activity.assigned_admin
        : null,
    createdBy:
      typeof activity.created_by === "string"
        ? activity.created_by
        : null,

    createdAt: String(activity.created_at),
    updatedAt: String(activity.updated_at),
  };
}
