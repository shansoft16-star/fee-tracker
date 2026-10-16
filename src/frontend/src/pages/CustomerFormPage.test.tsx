import { renderApp } from "@/__tests__/router-harness";
import { createFakeActor, makeCustomer } from "@/__tests__/test-utils";
import type { Customer } from "@/types";
import { screen, waitFor } from "@testing-library/react";
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

beforeEach(() => {
  actorRef.current = null;
  stateRef.current = null;
});

describe("CustomerFormPage", () => {
  it("creates a customer and shows it in the list", async () => {
    seed([]);
    const user = userEvent.setup();
    const { router } = renderApp("/customers/new");

    await screen.findByTestId("customer_form.form");
    await user.type(screen.getByLabelText(/customer name/i), "Asha Rao");
    await user.type(screen.getByLabelText(/mobile number/i), "9876543210");
    await user.type(screen.getByLabelText(/paid fees/i), "1000");
    await user.type(screen.getByLabelText(/due fees/i), "250");
    await user.click(screen.getByTestId("customer_form.submit_button"));

    await waitFor(() => expect(stateRef.current?.customers).toHaveLength(1));
    expect(stateRef.current?.customers[0]).toMatchObject({
      name: "Asha Rao",
      mobile: "9876543210",
      paidFees: 100000n,
      dueFees: 25000n,
      totalFees: 125000n,
    });

    // The form navigates back to the list, which now shows the new customer.
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/customers"),
    );
    expect(await screen.findByTestId("customers.list")).toBeInTheDocument();
    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
  });

  it("prefills the edit form and saves updated values", async () => {
    seed([
      makeCustomer({
        id: 1n,
        name: "Asha Rao",
        mobile: "9876543210",
        paidFees: 100000n,
        dueFees: 25000n,
        totalFees: 125000n,
      }),
    ]);
    const user = userEvent.setup();
    renderApp("/customers/1/edit");

    const name = await screen.findByLabelText(/customer name/i);
    expect(name).toHaveValue("Asha Rao");
    expect(screen.getByLabelText(/paid fees/i)).toHaveValue("1000.00");
    expect(screen.getByLabelText(/due fees/i)).toHaveValue("250.00");
    expect(screen.getByLabelText(/total fees/i)).toHaveValue("1250.00");

    await user.clear(name);
    await user.type(name, "Asha R Rao");
    await user.click(screen.getByTestId("customer_form.submit_button"));

    await waitFor(() =>
      expect(stateRef.current?.customers[0].name).toBe("Asha R Rao"),
    );
  });

  it("shows a not-found state when editing a missing customer", async () => {
    seed([]);
    renderApp("/customers/42/edit");

    expect(
      await screen.findByTestId("customer_form.error_state"),
    ).toBeInTheDocument();
  });
});
