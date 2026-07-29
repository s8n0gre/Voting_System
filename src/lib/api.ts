const BASE = import.meta.env.PUBLIC_API_URL ?? "/api";

// ─────────────────────────────────────────────────────────────
// Types (mirrors the DB contract)
// ─────────────────────────────────────────────────────────────

export interface SupportingRole {
  id: number;
  executiveCandidateId: number;
  title: string;
  responsibilities?: string;
}

export interface ExecutiveCandidate {
  id: number;
  name: string;
  role: string;
  email?: string;
  profileImage?: string;
}

export interface SupportingCandidate {
  id: number;
  supportingRoleId: number;
  name: string;
}

export interface VoteStatus {
  hasVoted: boolean;
  votedAt?: string;
}

export interface CandidateResult {
  id: number;
  name: string;
  role: string;
  votes: number;
}

export interface ResultsResponse {
  executiveResults: CandidateResult[];
  supportingResults: CandidateResult[];
}

export interface VotePayload {
  email: string;
  executiveCandidateId: number;
  supportingCandidateId: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

// ─────────────────────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body?.message ?? body?.error ?? errMsg;
    } catch {
      // ignore parse error
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────
// API Methods
// ─────────────────────────────────────────────────────────────

/** GET /roles — all executive candidates */
export async function getRoles(): Promise<ExecutiveCandidate[]> {
  return apiFetch<ExecutiveCandidate[]>("/roles");
}

/** GET /supporting-role/:id — supporting roles for an executive */
export async function getSupportingRoles(execId: number | string): Promise<SupportingRole[]> {
  return apiFetch<SupportingRole[]>(`/supporting-role/${execId}`);
}

/** GET /role/:id — single supporting role by its own ID */
export async function getSupportingRoleById(roleId: number | string): Promise<SupportingRole> {
  return apiFetch<SupportingRole>(`/role/${roleId}`);
}

/** GET /supporting-role/:id/candidates — eligible candidates for a role */
export async function getSupportingCandidates(
  id: number | string
): Promise<SupportingCandidate[]> {
  return apiFetch<SupportingCandidate[]>(`/supporting-role/${id}/candidates`);
}

/** GET /verify-student — check if an email exists in the Students table */
export async function verifyStudentEmail(email: string): Promise<{ exists: boolean; student: { rollNo: string; name: string; department: string | null; email: string } | null }> {
  return apiFetch(`/verify-student?email=${encodeURIComponent(email)}`);
}

/** GET /students — list all students (optional search) */
export async function getStudents(search?: string): Promise<Array<{ rollNo: string; name: string; department: string | null; email: string }>> {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch(`/students${q}`);
}

/** GET /status — whether the given email has already voted */
export async function getVoteStatus(email: string): Promise<VoteStatus> {
  return apiFetch<VoteStatus>(`/status?email=${encodeURIComponent(email)}`);
}

/** GET /results — live vote counts */
export async function getResults(): Promise<ResultsResponse> {
  return apiFetch<ResultsResponse>("/results");
}

/** POST /vote — submit a vote */
export async function submitVote(payload: VotePayload): Promise<{ success: boolean; message?: string }> {
  return apiFetch("/vote", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /nominations/:execId/:roleTitle — get nominees for a role */
export async function getNominations(execId: number | string, roleTitle: string): Promise<Array<{ id: number; executiveCandidateId: number; roleTitle: string; studentEmail: string; studentName: string; voteCount: number }>> {
  return apiFetch(`/nominations/${execId}/${encodeURIComponent(roleTitle)}`);
}

/** POST /nominate — nominate self for a role */
export async function nominateSelf(payload: { executiveCandidateId: number; roleTitle: string; email: string; name: string }): Promise<{ success: boolean }> {
  return apiFetch("/nominate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /vote-nominee — vote for a nominee */
export async function voteNominee(voterEmail: string, nominationId: number): Promise<{ success: boolean }> {
  return apiFetch("/vote-nominee", {
    method: "POST",
    body: JSON.stringify({ voterEmail, nominationId }),
  });
}

/** GET /my-nominations — get current user's nominations */
export async function getMyNominations(email: string): Promise<Array<{ id: number; executiveCandidateId: number; roleTitle: string }>> {
  return apiFetch(`/my-nominations?email=${encodeURIComponent(email)}`);
}

/** POST /withdraw-nomination — withdraw self-nomination */
export async function withdrawNomination(nominationId: number, email: string): Promise<{ success: boolean }> {
  return apiFetch("/withdraw-nomination", {
    method: "POST",
    body: JSON.stringify({ nominationId, email }),
  });
}
