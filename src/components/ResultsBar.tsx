import { useState, useEffect } from "react";
import { getResults } from "../lib/api";
import type { CandidateResult } from "../lib/api";

interface ResultsBarProps {
  pollInterval?: number; // ms, default 8000
}

export function ResultsBar({ pollInterval = 8000 }: ResultsBarProps) {
  const [execResults, setExecResults] = useState<CandidateResult[]>([]);
  const [suppResults, setSuppResults] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchResults() {
    try {
      const data = await getResults();
      setExecResults(data.executiveResults ?? []);
      setSuppResults(data.supportingResults ?? []);
      setError(null);
    } catch (e) {
      setError("Could not load results.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: "64px", borderRadius: "0.75rem" }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(244,63,94,0.08)",
          border: "1px solid rgba(244,63,94,0.2)",
          borderRadius: "0.75rem",
          color: "#fb7185",
          fontSize: "0.875rem",
          textAlign: "center",
        }}
      >
        {error}
      </div>
    );
  }

  const renderSection = (title: string, results: CandidateResult[]) => {
    const sorted = [...results].sort((a, b) => b.votes - a.votes);
    const totalVotes = results.reduce((acc, c) => acc + c.votes, 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>{title}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
            Total votes: <strong style={{ color: "var(--text-secondary)" }}>{totalVotes}</strong>
          </p>
        </div>

        {sorted.map((candidate, i) => {
          const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
          
          return (
            <div
              key={`${candidate.id}-${candidate.role}`}
              style={{
                padding: "1rem 1.25rem",
                background: "var(--glass-bg)",
                border: `1px solid ${i === 0 && totalVotes > 0 ? "rgba(139,92,246,0.3)" : "var(--border-color)"}`,
                borderRadius: "0.75rem",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", gap: "0.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {i === 0 && totalVotes > 0 && (
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "0.15rem 0.5rem", background: "var(--accent-glow)", color: "var(--accent-light)", borderRadius: "999px", border: "1px solid rgba(139,92,246,0.25)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        Leading
                      </span>
                    )}
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {candidate.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-light)" }}>{candidate.role}</span>
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: i === 0 && totalVotes > 0 ? "var(--accent-light)" : "var(--text-secondary)" }}>
                  {percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${percentage}%`,
                    borderRadius: "999px",
                    background: i === 0 && totalVotes > 0 ? "linear-gradient(90deg, #8b5cf6, #a78bfa)" : "linear-gradient(90deg, #475569, #64748b)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              <p style={{ margin: "0.4rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {candidate.votes} vote{candidate.votes !== 1 ? "s" : ""}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#4ade80", fontWeight: 600 }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse-glow 2s infinite" }} />
          Live updates enabled
        </span>
      </div>
      {renderSection("Executive Team", execResults)}
      {renderSection("Supporting Roles", suppResults)}
    </div>
  );
}

export default ResultsBar;
