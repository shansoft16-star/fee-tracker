import type { Customer, CustomerInput, CustomerUpdate } from "@/backend";

export type { Customer, CustomerInput, CustomerUpdate };

/** A customer record with money values kept as integer minor units (cents). */
export type CustomerRecord = Customer;

/** Payload for creating a customer. */
export type CustomerDraft = CustomerInput;

/** Payload for updating a customer. */
export type CustomerPatch = CustomerUpdate;

/** Sort options offered on the customer list. */
export type CustomerSort = "name" | "total" | "due";

/** Search/sort/filter state mirrored into the URL. */
export interface CustomerListSearch {
  q?: string;
  sort?: CustomerSort;
  duesOnly?: boolean;
}

/** Aggregate figures shown on the dashboard summary. */
export interface LedgerSummary {
  customerCount: number;
  totalCollected: bigint;
  totalDue: bigint;
  totalBilled: bigint;
}
