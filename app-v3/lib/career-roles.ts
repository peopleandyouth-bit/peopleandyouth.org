// ---------------------------------------------------------------------------
// lib/career-roles.ts
//
// Single source of truth for institutional career roles.
// Imported by:
//   - app/admin/command-centre/page.tsx (Founder's Office provisioning form)
//   - app/admin/candidate-applications (manual-log + promote modals)
//   - any future form that needs the role taxonomy
//
// Do not duplicate this list anywhere else. If the taxonomy changes, it
// changes here once.
// ---------------------------------------------------------------------------

export const GLOBAL_CAREER_ROLES = [
  "Founder & Chair", "Chief Executive Officer", "Chief Operating Officer", "Chief Technology Officer", "Chief Editor",
  "General Counsel", "Chief Policy Officer", "Director of Research", "Director of Communications", "Director of Operations",
  "Director of Fellowships", "Director of Strategic Partnerships", "Director of Finance", "Director of Regional Development", "Managing Trustee",
  "Managing Editor", "Senior Editor", "Associate Editor", "Copy Editor", "Journal Editor - Education Renaissance",
  "Journal Editor - Trade Renaissance", "Journal Editor - Policy Renaissance", "Journal Editor - Technology Renaissance",
  "Journal Editor - Economic Renaissance", "Journal Editor - Governance Renaissance", "Journal Editor - Rural Renaissance",
  "Journal Editor - Social Renaissance", "Journal Editor - Environmental Renaissance", "Journal Editor - Health Renaissance",
  "Journal Editor - Agriculture Renaissance", "Journal Editor - Entrepreneurship Renaissance", "Dissent Dias Curator",
  "Opinion Editor", "Columnist", "Lead Fact Checker", "Translation Lead", "Peer Reviewer", "Acquisitions Editor", "Archival Historian", "Editorial Assistant",
  "Senior Policy Fellow", "Research Fellow", "Public Policy Analyst", "Legal Research Scholar", "Governance Analyst",
  "Climate & Environmental Fellow", "Macroeconomic Researcher", "Agrarian Policy Analyst", "Digital Infrastructure Fellow",
  "Legislative Drafter", "Constitutional Law Scholar", "Urban Planning Fellow", "Healthcare Systems Analyst", "Educational Reform Lead",
  "Defense & Foreign Policy Fellow", "Judicial Reform Analyst", "Human Rights Advocate", "Empirical Data Analyst", "Quantitative Policy Researcher",
  "Qualitative Field Analyst", "Gender Policy Fellow", "Labor & Economics Scholar", "Trade Strategy Analyst", "Energy Transition Fellow", "Policy Communications Lead",
  "State Coordinator - Bihar", "Zonal Operations Lead", "District Lead - Patna", "District Lead - Saharsa", "District Lead - Darbhanga",
  "District Lead - Muzaffarpur", "District Lead - Gaya", "District Lead - Bhagalpur", "District Lead - Purnea", "District Lead - Madhubani",
  "District Lead - Begusarai", "District Lead - Nalanda", "District Lead - Munger", "District Lead - Rohtas", "District Lead - Vaishali",
  "District Lead - Samastipur", "District Lead - Sitamarhi", "District Lead - Siwan", "District Lead - West Champaran", "District Lead - East Champaran",
  "District Lead - Katihar", "District Lead - Araria", "District Lead - Kishanganj", "District Lead - Gopalganj", "District Lead - Buxar",
  "District Lead - Bhojpur", "District Lead - Kaimur", "District Lead - Jamui", "District Lead - Khagaria", "District Lead - Lakhisarai",
  "Chief Campus Ambassador", "Campus Lead - Patna University", "Campus Lead - Jawaharlal Nehru University (JNU)",
  "Campus Lead - University of Delhi (DU)", "Campus Lead - Banaras Hindu University (BHU)", "Campus Lead - Aligarh Muslim University (AMU)",
  "Campus Lead - NLSIU Bengaluru", "Campus Lead - NALSAR Hyderabad", "Campus Lead - IIT Delhi", "Campus Lead - IIT Patna",
  "Campus Lead - IIM Ahmedabad", "Campus Lead - IIM Bodh Gaya", "Campus Lead - Chanakya National Law University",
  "Campus Lead - Tata Institute of Social Sciences (TISS)", "Campus Lead - Ashoka University", "Campus Lead - Jamia Millia Islamia",
  "Campus Lead - Hyderabad Central University", "Campus Lead - Panjab University", "Campus Lead - Jadavpur University",
  "Campus Lead - St. Xavier's College", "Campus Coordinator", "Youth Organizer", "Student Representative", "Student Editor", "Campus Outreach Officer",
  "Lead Systems Architect", "Full Stack Engineer", "AI & Data Infrastructure Lead", "UI/UX Designer", "Frontend Engineer",
  "Backend Systems Developer", "Database Administrator", "Cybersecurity Officer", "Media Production Lead", "Video Journalist",
  "Audio/Podcast Producer", "Visual Designer", "Brand Strategist", "SEO & Analytics Lead", "Social Media Director",
  "Executive Secretary", "Administrative Officer", "Legal Advisor", "RTI & Compliance Officer", "Human Resources Lead",
  "Finance & Audit Manager", "Grant Writer", "Event Coordinator", "Field Logistics Lead", "Volunteer Coordinator",
  "Institutional Relations Officer", "Records & Protocol Officer"
];

// ---------------------------------------------------------------------------
// Department taxonomy for the candidate application system.
// Used by the manual-log and promote modals when a role's department must be
// picked separately from the role title.
// ---------------------------------------------------------------------------

export const CANDIDATE_DEPARTMENTS = [
  "Executive Board",
  "Research",
  "Policy",
  "Editorial",
  "Technology",
  "Operations",
  "Communications",
  "Human Resources",
  "Finance",
  "Legal",
  "Regional",
  "Field Operations",
  "Youth & Campus",
];

// ---------------------------------------------------------------------------
// Preference taxonomy for applicant role type.
// ---------------------------------------------------------------------------

export const PREFERRED_ROLE_TYPES = [
  "Full-Time",
  "Fellowship",
  "Part-Time / Remote",
  "Volunteer / Leadership",
];