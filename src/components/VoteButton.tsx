import { useState, useCallback } from "react";
import { submitVote } from "../lib/api";
import { getSessionEmail, setVoteSelection, markSessionVoted } from "../lib/auth";
import { showToast } from "./Toast";
import { Modal } from "./Modal";

interface VoteButtonProps {
  executiveCandidateId: number;
  executiveCandidateName: string;
  executiveRole: string;
  supportingCandidateId: number | null;
  supportingCandidateName: string | null;
  supportingRoleTitle: string | null;
}

export function VoteButton({
  executiveCandidateId,
  executiveCandidateName,
  executiveRole,
  supportingCandidateId,
  supportingCandidateName,
  supportingRoleTitle,
}: VoteButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canVote =
    executiveCandidateId !== null &&
    supportingCandidateId !== null;

  const handleVoteClick = useCallback(() => {
    if (!canVote) return;
    setShowModal(true);
  }, [canVote]);

  const handleConfirm = useCallback(async () => {
    const email = getSessionEmail();
    if (!email) {
      showToast("Session expired. Please sign in again.", "error");
      window.location.href = "/";
      return;
    }
    if (!supportingCandidateId) {
      showToast("Please select a supporting candidate first.", "error");
      return;
    }

    setLoading(true);
    try {
      await submitVote({
        email,
        executiveCandidateId,
        supportingCandidateId,
      });

      // Persist selection for thank-you page
      setVoteSelection({
        executiveCandidateId,
        executiveCandidateName,
        executiveRole,
        supportingCandidateId,
        supportingCandidateName,
        supportingRoleTitle,
      });

      markSessionVoted();
      setSubmitted(true);
      setShowModal(false);
      showToast("Your vote has been recorded! 🎉", "success");

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "/thank-you";
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit vote.";
      showToast(msg, "error");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  }, [
    supportingCandidateId,
    executiveCandidateId,
    executiveCandidateName,
    executiveRole,
    supportingCandidateName,
    supportingRoleTitle,
  ]);

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.875rem 1.5rem",
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: "0.75rem",
          color: "#4ade80",
          fontWeight: 600,
          fontSize: "0.9rem",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Vote submitted! Redirecting…
      </div>
    );
  }

  return (
    <>
      <button
        id="submit-vote-btn"
        onClick={handleVoteClick}
        disabled={!canVote || loading}
        className="btn-primary"
        aria-disabled={!canVote}
        aria-describedby={!canVote ? "vote-hint" : undefined}
        style={{ width: "100%", justifyContent: "center", padding: "0.875rem" }}
      >
        {loading ? (
          <>
            <span className="spinner" />
            <span>Submitting…</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            Cast Your Vote
          </>
        )}
      </button>

      {!canVote && (
        <p
          id="vote-hint"
          role="status"
          style={{
            marginTop: "0.5rem",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          Select a supporting candidate above to enable voting.
        </p>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => !loading && setShowModal(false)}
        onConfirm={handleConfirm}
        title="Confirm Your Vote"
        confirmLabel="Yes, Cast My Vote"
        cancelLabel="Go Back"
        loading={loading}
      >
        <p style={{ marginBottom: "1.25rem" }}>
          You are about to cast your vote. <strong>This action cannot be undone.</strong>
        </p>
        <div
          style={{
            padding: "1rem",
            background: "var(--glass-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Executive Candidate
            </span>
            <p style={{ margin: "0.2rem 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
              {executiveCandidateName}
            </p>
            <p style={{ margin: "0.1rem 0 0", fontSize: "0.82rem", color: "var(--accent-light)" }}>
              {executiveRole}
            </p>
          </div>
          <div style={{ height: "1px", background: "var(--border-color)" }} />
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Supporting Member
            </span>
            <p style={{ margin: "0.2rem 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
              {supportingCandidateName ?? "—"}
            </p>
            {supportingRoleTitle && (
              <p style={{ margin: "0.1rem 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                {supportingRoleTitle}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default VoteButton;
