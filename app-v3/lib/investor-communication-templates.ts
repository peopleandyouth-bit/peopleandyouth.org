// lib/investor-communication-templates.ts
//
// Phase 7C — Institutional communication template library.
//
// Each template encodes a structured message appropriate to a
// specific relationship context. Templates are rendered against
// live investor state with placeholder substitution. The rendered
// output is used to compose EMAIL activities, FOLLOW_UP actions,
// MEETING follow-ups and notification records.

export type TemplateStage =
  | "PROSPECT"
  | "CONTACTED"
  | "INTERESTED"
  | "NDA"
  | "DUE_DILIGENCE"
  | "COMMITMENT"
  | "INVESTED";

export type TemplateActivityType =
  | "EMAIL"
  | "FOLLOW_UP"
  | "CALL"
  | "MEETING"
  | "NOTE";

export type TemplateCategory =
  | "INTRODUCTION"
  | "FOLLOW_UP"
  | "MEETING_FOLLOW_UP"
  | "DUE_DILIGENCE"
  | "NEXT_STEPS"
  | "COMMITMENT"
  | "OBJECTION_RESPONSE"
  | "APPROVAL_NOTIFICATION"
  | "DATAROOM_NOTIFICATION";

export interface CommunicationTemplate {
  id: string;
  category: TemplateCategory;
  name: string;
  description: string;
  activityType: TemplateActivityType;
  suggestedStages: TemplateStage[];
  suggestedDueDays?: number;
  subjectTemplate: string;
  bodyTemplate: string;
  placeholders: string[];
}

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  INTRODUCTION: "Introduction",
  FOLLOW_UP: "Follow-up",
  MEETING_FOLLOW_UP: "Meeting Follow-up",
  DUE_DILIGENCE: "Due Diligence",
  NEXT_STEPS: "Next Steps",
  COMMITMENT: "Commitment",
  OBJECTION_RESPONSE: "Objection Response",
  APPROVAL_NOTIFICATION: "Approval Notification",
  DATAROOM_NOTIFICATION: "Data Room Notification",
};

export const TEMPLATE_PLACEHOLDERS = [
  "{investor_name}",
  "{first_name}",
  "{organization}",
  "{investor_type}",
  "{stage}",
  "{assigned_admin}",
] as const;

export const COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: "INTRO_01",
    category: "INTRODUCTION",
    name: "Institutional Introduction",
    description:
      "First contact after an investor is registered. Introduces People & Youth and invites a conversation.",
    activityType: "EMAIL",
    suggestedStages: ["PROSPECT", "CONTACTED"],
    subjectTemplate:
      "People & Youth — Institutional Introduction",
    bodyTemplate: `Dear {first_name},

Thank you for your interest in People & Youth.

We are building an institutional platform focused on knowledge, youth, civic participation, leadership and long-term institutional development. Given your interest as a {investor_type}, I would be pleased to continue the conversation and understand your priorities in greater detail.

I can share the institutional overview and the current capital formation context at your convenience.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: [
      "{first_name}",
      "{investor_type}",
      "{assigned_admin}",
    ],
  },
  {
    id: "FOLLOW_UP_01",
    category: "FOLLOW_UP",
    name: "Relationship Follow-up",
    description:
      "General follow-up for an active relationship that needs a touchpoint.",
    activityType: "EMAIL",
    suggestedStages: [
      "CONTACTED",
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
      "COMMITMENT",
    ],
    suggestedDueDays: 3,
    subjectTemplate:
      "People & Youth — Investor Relations Follow-up",
    bodyTemplate: `Dear {first_name},

I am writing to follow up on our recent engagement with People & Youth and to continue the conversation regarding our institutional development and investment opportunity.

We would be pleased to share any additional information required and discuss the next steps at a convenient time.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: ["{first_name}", "{assigned_admin}"],
  },
  {
    id: "FOLLOW_UP_02",
    category: "FOLLOW_UP",
    name: "Re-engagement (Stale)",
    description:
      "Re-engages an investor whose relationship has gone quiet.",
    activityType: "EMAIL",
    suggestedStages: [
      "CONTACTED",
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
    ],
    suggestedDueDays: 2,
    subjectTemplate:
      "People & Youth — Reconnecting on the Institutional Opportunity",
    bodyTemplate: `Dear {first_name},

I hope this message finds you well. I wanted to reconnect on the People & Youth institutional opportunity and understand whether your priorities have shifted or whether there is a natural point to continue the conversation.

We remain committed to building a durable institution and would value your perspective.

If it would be helpful, I can share a concise update on our progress and the current stage of our capital formation.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: ["{first_name}", "{assigned_admin}"],
  },
  {
    id: "MEETING_FU_01",
    category: "MEETING_FOLLOW_UP",
    name: "Meeting Follow-up",
    description:
      "Post-meeting follow-up summarising the discussion and confirming next steps.",
    activityType: "EMAIL",
    suggestedStages: [
      "CONTACTED",
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
      "COMMITMENT",
    ],
    suggestedDueDays: 2,
    subjectTemplate:
      "People & Youth — Follow-up on our conversation",
    bodyTemplate: `Dear {first_name},

Thank you for the conversation. I appreciated the opportunity to walk you through the People & Youth institutional thesis and to hear your perspective as a {investor_type}.

To confirm our discussion, the key points we covered included:

• The institutional platform and its long-term architecture
• The current capital formation context
• The materials we agreed to share

I will follow up with the specific materials we discussed. In the meantime, please feel free to reach out with any additional questions.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: [
      "{first_name}",
      "{investor_type}",
      "{assigned_admin}",
    ],
  },
  {
    id: "DD_01",
    category: "DUE_DILIGENCE",
    name: "Due Diligence Materials",
    description:
      "Provides data room access and offers clarifications during diligence.",
    activityType: "EMAIL",
    suggestedStages: ["DUE_DILIGENCE"],
    suggestedDueDays: 1,
    subjectTemplate:
      "People & Youth — Due Diligence Materials",
    bodyTemplate: `Dear {first_name},

Thank you for progressing your engagement with People & Youth to due diligence.

We are pleased to support your process and have prepared the relevant institutional, operational and financial materials in the secure investor data room. Please let us know if there are specific materials or clarifications you would like us to address, and we will respond promptly.

We are available for follow-up conversations as needed.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: ["{first_name}", "{assigned_admin}"],
  },
  {
    id: "NEXT_01",
    category: "NEXT_STEPS",
    name: "Next Steps",
    description:
      "Proposes concrete next steps and a meeting to advance the relationship.",
    activityType: "EMAIL",
    suggestedStages: ["INTERESTED", "NDA", "DUE_DILIGENCE"],
    suggestedDueDays: 3,
    subjectTemplate: "People & Youth — Next Steps",
    bodyTemplate: `Dear {first_name},

Thank you for your continued engagement with People & Youth.

We would like to discuss the next steps in our conversation, including the proposed investment structure, timeline and any outstanding diligence requirements.

Please share a suitable time for a conversation and I will confirm.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: ["{first_name}", "{assigned_admin}"],
  },
  {
    id: "COMMIT_01",
    category: "COMMITMENT",
    name: "Commitment Confirmation",
    description:
      "Confirms a verbal or written commitment and outlines documentation steps.",
    activityType: "EMAIL",
    suggestedStages: ["COMMITMENT"],
    suggestedDueDays: 2,
    subjectTemplate:
      "People & Youth — Confirming our Commitment Discussion",
    bodyTemplate: `Dear {first_name},

Thank you for confirming your interest in participating in the People & Youth capital formation.

To ensure alignment, I will be sharing the documentation required to formalise your commitment. This includes the subscription documentation, the institutional overview and the current cap table summary.

Please let me know if you have any questions as you review the materials.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: ["{first_name}", "{assigned_admin}"],
  },
  {
    id: "OBJECTION_01",
    category: "OBJECTION_RESPONSE",
    name: "Objection Response",
    description:
      "Acknowledges and addresses a specific investor objection.",
    activityType: "EMAIL",
    suggestedStages: [
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
      "COMMITMENT",
    ],
    suggestedDueDays: 3,
    subjectTemplate:
      "People & Youth — Response to your consideration",
    bodyTemplate: `Dear {first_name},

Thank you for raising your consideration openly — it is genuinely useful for us to understand the perspective of {investor_type}s at this stage of the conversation.

I would like to address the specific point you raised and to share the institutional context that shapes our approach. If helpful, I can walk you through the relevant details in a short conversation.

I value your perspective and would like to make sure your consideration is fully addressed.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: [
      "{first_name}",
      "{investor_type}",
      "{assigned_admin}",
    ],
  },
  {
    id: "APPROVAL_01",
    category: "APPROVAL_NOTIFICATION",
    name: "Approval Notification",
    description:
      "Confirms that the investor has been verified and approved for data room access.",
    activityType: "EMAIL",
    suggestedStages: ["NDA", "DUE_DILIGENCE", "COMMITMENT"],
    subjectTemplate:
      "People & Youth — Investor Access Approved",
    bodyTemplate: `Dear {first_name},

We are pleased to confirm that your investor access to the People & Youth data room has been approved.

You may now access the institutional materials made available to approved investors. If you encounter any issues or would like specific documents prepared in a different format, please let us know.

Thank you for your continued engagement.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: ["{first_name}", "{assigned_admin}"],
  },
  {
    id: "DATAROOM_01",
    category: "DATAROOM_NOTIFICATION",
    name: "Data Room Update",
    description:
      "Notifies the investor that new materials are available in the data room.",
    activityType: "EMAIL",
    suggestedStages: [
      "DUE_DILIGENCE",
      "COMMITMENT",
      "NDA",
    ],
    subjectTemplate:
      "People & Youth — New materials in your data room",
    bodyTemplate: `Dear {first_name},

New institutional materials have been added to your People & Youth data room.

You can access them through the secure investor portal. If there are specific materials you would like us to prioritise or prepare, please let us know and we will respond promptly.

Warm regards,
{assigned_admin}
Investor Relations Office`,
    placeholders: ["{first_name}", "{assigned_admin}"],
  },
];

export function getTemplateById(
  id: string
): CommunicationTemplate | null {
  return (
    COMMUNICATION_TEMPLATES.find((template) => template.id === id) ??
    null
  );
}

export interface TemplateRenderContext {
  investorName: string;
  firstName: string;
  organization: string;
  investorType: string;
  stage: string;
  assignedAdmin: string;
}

export function renderTemplate(
  template: CommunicationTemplate,
  context: TemplateRenderContext
): { subject: string; body: string; used: string[] } {
  const replacements: Record<string, string> = {
    "{investor_name}": context.investorName,
    "{first_name}": context.firstName,
    "{organization}": context.organization,
    "{investor_type}": context.investorType,
    "{stage}": context.stage,
    "{assigned_admin}": context.assignedAdmin,
  };

  const used = new Set<string>();

  const apply = (input: string) =>
    input.replace(
      /\{[a-z_]+\}/g,
      (match) => {
        const value = replacements[match];

        if (value === undefined) return match;

        used.add(match);
        return value || "—";
      }
    );

  return {
    subject: apply(template.subjectTemplate),
    body: apply(template.bodyTemplate),
    used: Array.from(used),
  };
}