import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LedgerSummary } from "@/types";
import { Receipt, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SummaryCardsProps {
  summary: LedgerSummary;
}

interface SummaryCard {
  key: string;
  label: string;
  value: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip. */
  chip: string;
  /** Tailwind classes for the value text. */
  valueClass: string;
}

/**
 * The three headline figures of the ledger: how many customers are on the
 * books, what has been collected, and what is still outstanding. Total billed
 * is surfaced as a supporting line so the row stays readable on a phone.
 */
export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards: SummaryCard[] = [
    {
      key: "customers",
      label: "Customers",
      value: String(summary.customerCount),
      icon: Users,
      chip: "bg-primary/10 text-primary",
      valueClass: "text-foreground",
    },
    {
      key: "collected",
      label: "Collected",
      value: formatMoney(summary.totalCollected),
      icon: TrendingUp,
      chip: "bg-success/12 text-success",
      valueClass: "text-success",
    },
    {
      key: "due",
      label: "Outstanding",
      value: formatMoney(summary.totalDue),
      icon: TrendingDown,
      chip: "bg-destructive/12 text-destructive",
      valueClass: "text-destructive",
    },
  ];

  return (
    <section data-ocid="dashboard.summary.section" className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              data-ocid={`dashboard.summary.card.${index + 1}`}
              className="animate-fade-up rounded-2xl border border-border bg-card p-3 shadow-elevated"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span
                className={cn(
                  "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
                  card.chip,
                )}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {card.label}
              </p>
              <p
                className={cn(
                  "font-numeric mt-1 truncate text-base font-semibold",
                  card.valueClass,
                )}
              >
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div
        data-ocid="dashboard.summary.billed"
        className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Receipt className="h-4 w-4 text-primary" aria-hidden="true" />
          Total billed
        </span>
        <span className="font-numeric text-base font-semibold text-foreground">
          {formatMoney(summary.totalBilled)}
        </span>
      </div>
    </section>
  );
}
