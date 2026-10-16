import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CustomerSort } from "@/types";
import { Search, X } from "lucide-react";

interface CustomerFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  sort: CustomerSort;
  onSortChange: (value: CustomerSort) => void;
  duesOnly: boolean;
  onDuesOnlyChange: (value: boolean) => void;
}

const SORT_OPTIONS: { value: CustomerSort; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "total", label: "Total" },
  { value: "due", label: "Due" },
];

/**
 * Search field plus sort and dues-only controls. All state is owned by the
 * page and mirrored into the URL search params.
 */
export function CustomerFilters({
  query,
  onQueryChange,
  sort,
  onSortChange,
  duesOnly,
  onDuesOnlyChange,
}: CustomerFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          inputMode="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by name or mobile"
          aria-label="Search customers by name or mobile"
          data-ocid="customers.search_input"
          className="h-11 rounded-full border-border bg-card pl-9 pr-9 text-base shadow-subtle"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            data-ocid="customers.search_clear_button"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <fieldset
          aria-label="Sort customers"
          className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-subtle"
        >
          <legend className="sr-only">Sort customers</legend>
          <span className="pl-2 pr-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sort
          </span>
          {SORT_OPTIONS.map((option) => {
            const active = sort === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSortChange(option.value)}
                aria-pressed={active}
                data-ocid={`customers.sort.${option.value}`}
                className={cn(
                  "tap-target rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth",
                  active
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </fieldset>

        <button
          type="button"
          onClick={() => onDuesOnlyChange(!duesOnly)}
          aria-pressed={duesOnly}
          data-ocid="customers.dues_only_toggle"
          className={cn(
            "tap-target flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-smooth",
            duesOnly
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border bg-card text-muted-foreground shadow-subtle hover:bg-muted hover:text-foreground",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-2 w-2 rounded-full",
              duesOnly ? "bg-destructive" : "bg-muted-foreground/50",
            )}
          />
          Dues only
        </button>
      </div>
    </div>
  );
}
