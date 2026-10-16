import { Layout } from "@/components/Layout";
import { PaidDueBreakdown } from "@/components/PaidDueBreakdown";
import { SummaryCards } from "@/components/SummaryCards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomers } from "@/hooks/use-customers";
import { formatMobile, formatMoney, initials } from "@/lib/format";
import type { Customer, LedgerSummary } from "@/types";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Plus, UserPlus, Users } from "lucide-react";

const RECENT_LIMIT = 5;

function summarize(customers: Customer[]): LedgerSummary {
  return customers.reduce<LedgerSummary>(
    (acc, customer) => ({
      customerCount: acc.customerCount + 1,
      totalCollected: acc.totalCollected + customer.paidFees,
      totalDue: acc.totalDue + customer.dueFees,
      totalBilled: acc.totalBilled + customer.totalFees,
    }),
    {
      customerCount: 0,
      totalCollected: 0n,
      totalDue: 0n,
      totalBilled: 0n,
    },
  );
}

function recentCustomers(customers: Customer[]): Customer[] {
  return [...customers]
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .slice(0, RECENT_LIMIT);
}

function CustomerRow({
  customer,
  index,
}: { customer: Customer; index: number }) {
  const settled = customer.dueFees === 0n;
  return (
    <Link
      to="/customers/$id"
      params={{ id: customer.id.toString() }}
      data-ocid={`dashboard.recent.item.${index + 1}`}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-subtle transition-smooth active:scale-[0.98]"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary"
        aria-hidden="true"
      >
        {initials(customer.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold text-foreground">
          {customer.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatMobile(customer.mobile)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={
            settled
              ? "font-numeric text-sm font-semibold text-success"
              : "font-numeric text-sm font-semibold text-destructive"
          }
        >
          {settled
            ? formatMoney(customer.paidFees)
            : formatMoney(customer.dueFees)}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {settled ? "Paid" : "Due"}
        </p>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-muted-foreground transition-smooth group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}

function DashboardSkeleton() {
  const ids = Array.from({ length: 3 }, (_, i) => `dashboard-skeleton-${i}`);
  return (
    <div data-ocid="dashboard.loading_state" className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {ids.map((id) => (
          <Skeleton key={id} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <div className="space-y-3">
        {ids.map((id) => (
          <Skeleton key={id} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      data-ocid="dashboard.empty_state"
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-subtle"
    >
      <span
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Users className="h-7 w-7" />
      </span>
      <h2 className="font-display text-lg font-semibold text-foreground">
        No customers yet
      </h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Add your first customer to start tracking paid, due, and total fees.
      </p>
      <Button
        asChild
        className="mt-6 h-12 rounded-full px-6 text-sm font-semibold"
      >
        <Link to="/customers/new" data-ocid="dashboard.empty_state.add_button">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add first customer
        </Link>
      </Button>
    </div>
  );
}

/** Dashboard: ledger summary, paid-vs-due breakdown, and recent customers. */
export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useCustomers();
  const customers = data ?? [];
  const summary = summarize(customers);
  const recent = recentCustomers(customers);

  return (
    <Layout
      title="Fee Ledger"
      action={
        <Link
          to="/customers/new"
          data-ocid="dashboard.header.add_button"
          aria-label="Add customer"
          className="tap-target flex items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-smooth hover:bg-primary-foreground/25 active:scale-95"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </Link>
      }
    >
      <div data-ocid="dashboard.page" className="space-y-6">
        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <div
            data-ocid="dashboard.error_state"
            className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
          >
            <AlertCircle
              className="mb-3 h-8 w-8 text-destructive"
              aria-hidden="true"
            />
            <h2 className="font-display text-base font-semibold text-foreground">
              Couldn't load your ledger
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Something went wrong fetching customers. Please try again.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
              data-ocid="dashboard.error_state.retry_button"
              className="mt-5 h-11 rounded-full px-6"
            >
              Retry
            </Button>
          </div>
        ) : customers.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <SummaryCards summary={summary} />
            <PaidDueBreakdown summary={summary} />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold text-foreground">
                  Recent customers
                </h2>
                <Link
                  to="/customers"
                  search={{
                    q: undefined,
                    sort: undefined,
                    duesOnly: undefined,
                  }}
                  data-ocid="dashboard.recent.view_all_link"
                  className="flex items-center gap-1 text-xs font-semibold text-primary transition-smooth hover:underline"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div data-ocid="dashboard.recent.list" className="space-y-3">
                {recent.map((customer, index) => (
                  <CustomerRow
                    key={customer.id.toString()}
                    customer={customer}
                    index={index}
                  />
                ))}
              </div>

              <Button
                asChild
                variant="secondary"
                className="h-12 w-full rounded-full text-sm font-semibold"
              >
                <Link
                  to="/customers/new"
                  data-ocid="dashboard.add_button"
                  className="flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Add customer
                </Link>
              </Button>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
