import { formatMoney } from "@/lib/format";
import type { LedgerSummary } from "@/types";

interface PaidDueBreakdownProps {
  summary: LedgerSummary;
}

/**
 * A single proportional bar splitting total billed into collected and
 * outstanding, with a legend. Reads at a glance on a phone and avoids the
 * overhead of a chart library for two values.
 */
export function PaidDueBreakdown({ summary }: PaidDueBreakdownProps) {
  const collected = Number(summary.totalCollected);
  const due = Number(summary.totalDue);
  const billed = collected + due;

  const collectedPct = billed > 0 ? (collected / billed) * 100 : 0;
  const duePct = billed > 0 ? (due / billed) * 100 : 0;
  const fullyPaid = billed > 0 && due === 0;

  return (
    <section
      data-ocid="dashboard.breakdown.section"
      className="rounded-2xl border border-border bg-card p-4 shadow-subtle"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-semibold text-foreground">
          Paid vs due
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          {billed > 0
            ? `${Math.round(collectedPct)}% collected`
            : "No fees billed yet"}
        </span>
      </div>

      <div
        data-ocid="dashboard.breakdown.bar"
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={
          billed > 0
            ? `Collected ${formatMoney(summary.totalCollected)} of ${formatMoney(
                summary.totalBilled,
              )}, outstanding ${formatMoney(summary.totalDue)}`
            : "No fees billed yet"
        }
      >
        {billed > 0 ? (
          <>
            <div
              className="h-full bg-success transition-smooth"
              style={{ width: `${collectedPct}%` }}
            />
            <div
              className="h-full bg-destructive transition-smooth"
              style={{ width: `${duePct}%` }}
            />
          </>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-success"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Collected
            </dt>
            <dd className="font-numeric truncate text-sm font-semibold text-success">
              {formatMoney(summary.totalCollected)}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Outstanding
            </dt>
            <dd className="font-numeric truncate text-sm font-semibold text-destructive">
              {formatMoney(summary.totalDue)}
            </dd>
          </div>
        </div>
      </dl>

      {fullyPaid ? (
        <p
          data-ocid="dashboard.breakdown.success_state"
          className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-xs font-medium text-success"
        >
          Every customer is fully paid up.
        </p>
      ) : null}
    </section>
  );
}
