import { Badge } from "@/components/ui/badge";
import { formatMobile, formatMoney, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CustomerRecord } from "@/types";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface CustomerCardProps {
  customer: CustomerRecord;
  /** 1-based position, used for a stable deterministic test marker. */
  index: number;
}

/**
 * A single ledger row: left color rail (success when settled, coral when dues
 * remain), identity block, and a right-aligned paid/due/total money column.
 */
export function CustomerCard({ customer, index }: CustomerCardProps) {
  const settled = customer.dueFees <= 0n;

  return (
    <Link
      to="/customers/$id"
      params={{ id: customer.id.toString() }}
      data-ocid={`customers.item.${index}`}
      className={cn(
        "group relative flex items-stretch gap-3 overflow-hidden rounded-2xl border border-border bg-card pl-4 pr-3 shadow-subtle transition-smooth",
        "hover:border-primary/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          settled ? "bg-success" : "bg-destructive",
        )}
      />

      <div className="flex min-w-0 flex-1 items-center gap-3 py-3.5">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold",
            settled
              ? "bg-success/12 text-success"
              : "bg-destructive/12 text-destructive",
          )}
        >
          {initials(customer.name)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold leading-tight text-foreground">
            {customer.name}
          </p>
          <p className="mt-0.5 truncate font-numeric text-xs text-muted-foreground">
            {formatMobile(customer.mobile)}
          </p>
          <div className="mt-1.5">
            {settled ? (
              <Badge
                variant="outline"
                className="border-success/30 bg-success/10 text-[10px] font-semibold uppercase tracking-wider text-success"
              >
                Settled
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-destructive/30 bg-destructive/10 text-[10px] font-semibold uppercase tracking-wider text-destructive"
              >
                Dues pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <dl className="grid grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-1 py-3.5 text-right">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Paid
          </dt>
          <dd className="font-numeric text-xs font-medium text-success">
            {formatMoney(customer.paidFees)}
          </dd>

          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Due
          </dt>
          <dd
            className={cn(
              "font-numeric text-xs font-medium",
              settled ? "text-muted-foreground" : "text-destructive",
            )}
          >
            {formatMoney(customer.dueFees)}
          </dd>

          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total
          </dt>
          <dd className="font-numeric text-xs font-semibold text-foreground">
            {formatMoney(customer.totalFees)}
          </dd>
        </dl>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-smooth group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
