import { renderApp } from "@/__tests__/router-harness";
import { createFakeActor, makeCustomer } from "@/__tests__/test-utils";
import type { Customer } from "@/types";
import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actorRef: {
  current: ReturnType<typeof createFakeActor>["actor"] | null;
} = { current: null };

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: actorRef.current, isFetching: false }),
}));

function seed(customers: Customer[]) {
  const { actor } = createFakeActor(customers);
  actorRef.current = actor;
}

const CUSTOMERS: Customer[] = [
  makeCustomer({
    id: 1n,
    name: "Asha Rao",
    mobile: "9876543210",
    paidFees: 100000n,
    dueFees: 25000n,
    totalFees: 125000n,
  }),
  makeCustomer({
    id: 2n,
    name: "Bilal Khan",
    mobile: "9123456780",
    paidFees: 50000n,
    dueFees: 0n,
    totalFees: 50000n,
  }),
  makeCustomer({
    id: 3n,
    name: "Chetan Verma",
    mobile: "9000011111",
    paidFees: 0n,
    dueFees: 75000n,
    totalFees: 75000n,
  }),
];

beforeEach(() => {
  actorRef.current = null;
});

describe("DashboardPage", () => {
  it("shows summary totals equal to the sum of all customers", async () => {
    seed(CUSTOMERS);
    renderApp("/");

    const summary = await screen.findByTestId("dashboard.summary.section");
    // 3 customers, collected 100000 + 50000 + 0 = 150000, due 25000 + 0 + 75000 = 100000.
    expect(within(summary).getByText("3")).toBeInTheDocument();
    expect(within(summary).getByText("₹1,500.00")).toBeInTheDocument();
    expect(within(summary).getByText("₹1,000.00")).toBeInTheDocument();
    // Total billed 125000 + 50000 + 75000 = 250000.
    expect(
      within(screen.getByTestId("dashboard.summary.billed")).getByText(
        "₹2,500.00",
      ),
    ).toBeInTheDocument();
  });

  it("renders the paid-vs-due breakdown with collected and outstanding", async () => {
    seed(CUSTOMERS);
    renderApp("/");

    const breakdown = await screen.findByTestId("dashboard.breakdown.section");
    expect(within(breakdown).getByText("Collected")).toBeInTheDocument();
    expect(within(breakdown).getByText("Outstanding")).toBeInTheDocument();
    expect(within(breakdown).getByText("₹1,500.00")).toBeInTheDocument();
    expect(within(breakdown).getByText("₹1,000.00")).toBeInTheDocument();
  });

  it("shows an empty state with a call to action when there are no customers", async () => {
    seed([]);
    renderApp("/");

    expect(
      await screen.findByTestId("dashboard.empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("dashboard.empty_state.add_button"),
    ).toBeInTheDocument();
  });

  it("lists recent customers linking to their detail pages", async () => {
    seed(CUSTOMERS);
    renderApp("/");

    const recent = await screen.findByTestId("dashboard.recent.list");
    const links = within(recent).getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "/customers/1");
  });
});
