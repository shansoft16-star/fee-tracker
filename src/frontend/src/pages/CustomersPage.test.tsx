import { renderApp } from "@/__tests__/router-harness";
import { createFakeActor, makeCustomer } from "@/__tests__/test-utils";
import type { Customer } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("CustomersPage", () => {
  it("lists every customer with name, mobile, paid, due, and total", async () => {
    seed(CUSTOMERS);
    renderApp("/customers");

    const list = await screen.findByTestId("customers.list");
    expect(within(list).getAllByRole("link")).toHaveLength(3);
    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getByText("98765 43210")).toBeInTheDocument();
    expect(screen.getByText("₹1,250.00")).toBeInTheDocument();
    expect(screen.getByText("₹250.00")).toBeInTheDocument();
  });

  it("shows an empty state with a call to action when there are no customers", async () => {
    seed([]);
    renderApp("/customers");

    expect(
      await screen.findByTestId("customers.empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("customers.empty_add_button"),
    ).toBeInTheDocument();
  });

  it("filters by name and by mobile number", async () => {
    seed(CUSTOMERS);
    const user = userEvent.setup();
    renderApp("/customers");

    await screen.findByTestId("customers.list");
    const search = screen.getByLabelText(/search customers/i);

    await user.type(search, "Bilal");
    await waitFor(() =>
      expect(screen.queryByText("Asha Rao")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Bilal Khan")).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "9000011111");
    await waitFor(() =>
      expect(screen.queryByText("Bilal Khan")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Chetan Verma")).toBeInTheDocument();
  });

  it("filters to customers with outstanding dues only", async () => {
    seed(CUSTOMERS);
    const user = userEvent.setup();
    renderApp("/customers");

    await screen.findByTestId("customers.list");
    await user.click(screen.getByTestId("customers.dues_only_toggle"));

    await waitFor(() =>
      expect(screen.queryByText("Bilal Khan")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getByText("Chetan Verma")).toBeInTheDocument();
  });

  it("sorts by total fees descending", async () => {
    seed(CUSTOMERS);
    const user = userEvent.setup();
    renderApp("/customers");

    await screen.findByTestId("customers.list");
    await user.click(screen.getByTestId("customers.sort.total"));

    await waitFor(() => {
      const links = within(screen.getByTestId("customers.list")).getAllByRole(
        "link",
      );
      expect(links[0]).toHaveTextContent("Asha Rao");
      expect(links[1]).toHaveTextContent("Chetan Verma");
      expect(links[2]).toHaveTextContent("Bilal Khan");
    });
  });

  it("reflects search, sort, and filter state in the URL", async () => {
    seed(CUSTOMERS);
    const user = userEvent.setup();
    const { router } = renderApp("/customers");

    await screen.findByTestId("customers.list");
    await user.type(screen.getByLabelText(/search customers/i), "Asha");
    await user.click(screen.getByTestId("customers.sort.due"));
    await user.click(screen.getByTestId("customers.dues_only_toggle"));

    await waitFor(() => {
      const search = router.state.location.search as {
        q?: string;
        sort?: string;
        duesOnly?: boolean;
      };
      expect(search.q).toBe("Asha");
      expect(search.sort).toBe("due");
      expect(search.duesOnly).toBe(true);
    });
  });

  it("restores search state from the URL on load", async () => {
    seed(CUSTOMERS);
    renderApp("/customers?q=Asha&sort=total&duesOnly=true");

    await screen.findByTestId("customers.list");
    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
    expect(screen.queryByText("Bilal Khan")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/search customers/i)).toHaveValue("Asha");
    expect(screen.getByTestId("customers.sort.total")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("customers.dues_only_toggle")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows a no-results state with a clear-filters action", async () => {
    seed(CUSTOMERS);
    const user = userEvent.setup();
    renderApp("/customers");

    await screen.findByTestId("customers.list");
    await user.type(screen.getByLabelText(/search customers/i), "zzzz");

    expect(
      await screen.findByTestId("customers.no_results_state"),
    ).toBeInTheDocument();
    await user.click(screen.getByTestId("customers.clear_filters_button"));
    expect(await screen.findByTestId("customers.list")).toBeInTheDocument();
  });
});
