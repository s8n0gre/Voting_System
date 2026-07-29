// ─────────────────────────────────────────────────────────────
// Allowed institutional email domains
// ─────────────────────────────────────────────────────────────

export const ALLOWED_DOMAINS = ["kce.ac.in", "karpagamtech.ac.in"] as const;

export type AllowedDomain = (typeof ALLOWED_DOMAINS)[number];

const SESSION_KEY = "voting_email";
const SESSION_NAME_KEY = "voting_name";
const VOTED_KEY = "voting_has_voted";

// ─────────────────────────────────────────────────────────────
// Email validation
// ─────────────────────────────────────────────────────────────

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isAllowedDomain(email: string): boolean {
  const domain = email.trim().split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain as AllowedDomain);
}

export function validateInstitutionalEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: "Email is required." };
  if (!isValidEmailFormat(trimmed)) return { valid: false, error: "Invalid email format." };
  if (!isAllowedDomain(trimmed))
    return {
      valid: false,
      error: `Only @kce.ac.in and @karpagamtech.ac.in emails are allowed.`,
    };
  return { valid: true };
}

// ─────────────────────────────────────────────────────────────
// Session helpers (client-side only)
// ─────────────────────────────────────────────────────────────

export function getSessionEmail(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function setSessionEmail(email: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, email.trim().toLowerCase());
}

export function getSessionName(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(SESSION_NAME_KEY);
}

export function setSessionName(name: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(SESSION_NAME_KEY, name);
}

export function clearSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_NAME_KEY);
  sessionStorage.removeItem(VOTED_KEY);
}

export function markSessionVoted(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(VOTED_KEY, "true");
}

export function getSessionVoted(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(VOTED_KEY) === "true";
}

// ─────────────────────────────────────────────────────────────
// Vote selection store (in-memory, persisted to sessionStorage)
// ─────────────────────────────────────────────────────────────

const SELECTION_KEY = "voting_selection";

export interface VoteSelection {
  executiveCandidateId: number | null;
  executiveCandidateName: string | null;
  executiveRole: string | null;
  supportingCandidateId: number | null;
  supportingCandidateName: string | null;
  supportingRoleTitle: string | null;
}

export function getVoteSelection(): VoteSelection {
  if (typeof sessionStorage === "undefined") {
    return {
      executiveCandidateId: null,
      executiveCandidateName: null,
      executiveRole: null,
      supportingCandidateId: null,
      supportingCandidateName: null,
      supportingRoleTitle: null,
    };
  }
  const raw = sessionStorage.getItem(SELECTION_KEY);
  if (!raw) {
    return {
      executiveCandidateId: null,
      executiveCandidateName: null,
      executiveRole: null,
      supportingCandidateId: null,
      supportingCandidateName: null,
      supportingRoleTitle: null,
    };
  }
  return JSON.parse(raw) as VoteSelection;
}

export function setVoteSelection(selection: Partial<VoteSelection>): void {
  if (typeof sessionStorage === "undefined") return;
  const current = getVoteSelection();
  sessionStorage.setItem(
    SELECTION_KEY,
    JSON.stringify({ ...current, ...selection })
  );
}

export function clearVoteSelection(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(SELECTION_KEY);
}
