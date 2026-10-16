import { CustomerCard } from "@/components/CustomerCard";
import { CustomerFilters } from "@/components/CustomerFilters";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomers } from "@/hooks/use-customers";
import { formatMobile } from "@/lib/format";
import type { CustomerRecord, CustomerSort } from "@/types";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus, SearchX, UserPlus, Users } from "lucide-react";
import { useMemo } from "react";

const SKELETON_IDS = Array.from(
  { length: 5 },
  (_, i) => `customer-skeleton-${i}`,
);

function matchesQuery(customer: CustomerRecord, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const digits = needle.replace(/\D/g, "");
  const nameMatch = customer.name.toLowerCase().includes(needle);
  const mobileMatch =
    digits.length > 0 && customer.mobile.replace(/\D/g, "").includes(digits);
  return nameMatch || mobileMatch;
}

function compareCustomers(
  a: CustomerRecord,
  b: CustomerRecord,
  sort: CustomerSort,
): number {
  if (sort === "total") {
    if (a.totalFees === b.totalFees) return a.name.localeCompare(b.name);
    return a.totalFees > b.totalFees ? -1 : 1;
  }
  if (sort === "due") {
    if (a.dueFees === b.dueFees) return a.name.localeCompare(b.name);
    return a.dueFees > b.dueFees ? -1 : 1;
  }
  return a.name.localeCompare(b.name);
}

export function CustomersPage() {
  const search = useSearch({ from: "/customers" });
  const navigate = useNavigate({ from: "/customers" });
  const { data, isLoading, isError, refetch } = useCustomers();

  const query = search.q ?? "";
  const sort: CustomerSort =
    search.sort === "total" || search.sort === "due" ? search.sort : "name";
  const duesOnly = search.duesOnly ?? false;

  const customers = useMemo(() => data ?? [], [data]);

  const visible = useMemo(() => {
    return customers
      .filter((customer) => (duesOnly ? customer.dueFees > 0n : true))
      .filter((customer) => matchesQuery(customer, query))
      .sort((a, b) => compareCustomers(a, b, sort));
  }, [customers, duesOnly, query, sort]);

  const hasCustomers = customers.length > 0;
  const filtersActive = query.trim().length > 0 || duesOnly;

  const updateSearch = (patch: {
    q?: string;
    sort?: CustomerSort;
    duesOnly?: boolean;
  }) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    });
  };

  const addAction = (
    <Link
      to="/customers/new"
      data-ocid="customers.add_button"
      aria-label="Add customer"
      className="tap-target flex items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-smooth hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
    </Link>
  );

  return (
    <Layout title="Customers" action={addAction}>
      <div data-ocid="customers.page" className="space-y-4">
        <CustomerFilters
          query={query}
          onQueryChange={(value) => updateSearch({ q: value || undefined })}
          sort={sort}
          onSortChange={(value) => updateSearch({ sort: value })}
          duesOnly={duesOnly}
          onDuesOnlyChange={(value) =>
            updateSearch({ duesOnly: value || undefined })
          }
        />

        {isLoading ? (
          <ul
            data-ocid="customers.loading_state"
            className="space-y-3"
            aria-busy="true"
            aria-label="Loading customers"
          >
            {SKELETON_IDS.map((id) => (
              <li key={id}>
                <Skeleton className="h-[92px] w-full rounded-2xl" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div
            data-ocid="customers.error_state"
            className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
          >
            <p className="font-display text-base font-semibold text-foreground">
              Couldn&apos;t load customers
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Something went wrong while fetching the ledger. Please try again.
            </p>
            <Button
              type="button"
              variant="outline"
              data-ocid="customers.retry_button"
              onClick={() => void refetch()}
              className="rounded-full"
            >
              Retry
            </Button>
          </div>
        ) : !hasCustomers ? (
          <div
            data-ocid="customers.empty_state"
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-subtle"
          >
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/12 text-accent"
            >
              <Users className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-lg font-semibold text-foreground">
                No customers yet
              </p>
              <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                Add your first customer to start tracking paid, due, and total
                fees.
              </p>
            </div>
            <Button
              asChild
              data-ocid="customers.empty_add_button"
              className="rounded-full"
            >
              <Link to="/customers/new">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Add customer
              </Link>
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div
            data-ocid="customers.no_results_state"
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-subtle"
          >
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <SearchX className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-lg font-semibold text-foreground">
                No matching customers
              </p>
              <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                {query.trim()
                  ? `Nothing matches “${query.trim()}”${
                      duesOnly ? " with outstanding dues" : ""
                    }.`
                  : "No customers have outstanding dues right now."}
              </p>
            </div>
            {filtersActive ? (
              <Button
                type="button"
                variant="outline"
                data-ocid="customers.clear_filters_button"
                onClick={() =>
                  updateSearch({ q: undefined, duesOnly: undefined })
                }
                className="rounded-full"
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <p
              data-ocid="customers.result_count"
              className="px-1 text-xs font-medium text-muted-foreground"
            >
              {visible.length} {visible.length === 1 ? "customer" : "customers"}
              {duesOnly ? " with dues" : ""}
            </p>
            <ul data-ocid="customers.list" className="space-y-3">
              {visible.map((customer, index) => (
                <li key={customer.id.toString()}>
                  <CustomerCard customer={customer} index={index + 1} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Layout>
  );
}
