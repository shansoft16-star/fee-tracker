import { renderApp } from "@/__tests__/router-harness";
import { createFakeActor, makeCustomer } from "@/__tests__/test-utils";
import type { Customer } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actorRef: {
  current: ReturnType<typeof createFakeActor>["actor"] | null;
} = { current: null };
const stateRef: {
  current: ReturnType<typeof createFakeActor>["state"] | null;
} = { current: null };

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: actorRef.current, isFetching: false }),
}));

function seed(customers: Customer[]) {
  const { actor, state } = createFakeActor(customers);
  actorRef.current = actor;
  stateRef.current = state;
}

const ASHA = makeCustomer({
  id: 1n,
  name: "Asha Rao",
  mobile: "9876543210",
  paidFees: 100000n,
  dueFees: 25000n,
  totalFees: 125000n,
});

beforeEach(() => {
  actorRef.current = null;
  stateRef.current = null;
});

describe("CustomerDetailPage", () => {
  it("shows all fee fields and a dues-pending status", async () => {
    seed([ASHA]);
    renderApp("/customers/1");

    const fees = await screen.findByTestId("customer_detail.fees_card");
    expect(within(fees).getByText("Paid fees")).toBeInTheDocument();
    expect(within(fees).getByText("₹1,000.00")).toBeInTheDocument();
    expect(within(fees).getByText("Due fees")).toBeInTheDocument();
    expect(within(fees).getByText("₹250.00")).toBeInTheDocument();
    expect(within(fees).getByText("Total fees")).toBeInTheDocument();
    expect(within(fees).getByText("₹1,250.00")).toBeInTheDocument();
    expect(
      screen.getByTestId("customer_detail.status_badge"),
    ).toHaveTextContent(/dues pending/i);
  });

  it("shows a settled status when there are no dues", async () => {
    seed([
      makeCustomer({
        id: 2n,
        name: "Bilal Khan",
        mobile: "9123456780",
        paidFees: 50000n,
        dueFees: 0n,
        totalFees: 50000n,
      }),
    ]);
    renderApp("/customers/2");

    expect(
      await screen.findByTestId("customer_detail.status_badge"),
    ).toHaveTextContent(/settled/i);
  });

  it("shows a not-found state for an unknown customer", async () => {
    seed([ASHA]);
    renderApp("/customers/999");

    expect(
      await screen.findByTestId("customer_detail.error_state"),
    ).toBeInTheDocument();
  });

  it("deletes the customer only after confirmation", async () => {
    seed([ASHA]);
    const user = userEvent.setup();
    renderApp("/customers/1");

    await screen.findByTestId("customer_detail.page");
    await user.click(screen.getByTestId("customer_detail.delete_button"));

    // The confirmation dialog appears; cancelling keeps the record.
    const dialog = await screen.findByTestId("delete_customer.dialog");
    expect(within(dialog).getByText(/delete Asha Rao\?/i)).toBeInTheDocument();
    await user.click(screen.getByTestId("delete_customer.cancel_button"));
    await waitFor(() =>
      expect(
        screen.queryByTestId("delete_customer.dialog"),
      ).not.toBeInTheDocument(),
    );
    expect(stateRef.current?.customers).toHaveLength(1);

    // Confirming removes it.
    await user.click(screen.getByTestId("customer_detail.delete_button"));
    await screen.findByTestId("delete_customer.dialog");
    await user.click(screen.getByTestId("delete_customer.confirm_button"));

    await waitFor(() => expect(stateRef.current?.customers).toHaveLength(0));
  });

  it("navigates to the edit form from the detail view", async () => {
    seed([ASHA]);
    const user = userEvent.setup();
    const { router } = renderApp("/customers/1");

    await screen.findByTestId("customer_detail.page");
    await user.click(screen.getByTestId("customer_detail.edit_button"));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/customers/1/edit"),
    );
    expect(await screen.findByTestId("customer_form.form")).toBeInTheDocument();
  });
});
