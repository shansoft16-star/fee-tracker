import { CustomerForm } from "@/components/CustomerForm";
import type { CustomerInput } from "@/types";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

function setup(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const user = userEvent.setup();
  render(
    <CustomerForm
      submitLabel="Add customer"
      onSubmit={onSubmit}
      onSaved={vi.fn()}
    />,
  );
  return { user, onSubmit };
}

describe("CustomerForm", () => {
  it("auto-computes total fees from paid + due as the user types", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/paid fees/i), "1000");
    await user.type(screen.getByLabelText(/due fees/i), "250");

    expect(screen.getByLabelText(/total fees/i)).toHaveValue("1250.00");
  });

  it("stops auto-tracking once the total is edited, and can reset to auto", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/paid fees/i), "1000");
    await user.type(screen.getByLabelText(/due fees/i), "250");
    expect(screen.getByLabelText(/total fees/i)).toHaveValue("1250.00");

    const total = screen.getByLabelText(/total fees/i);
    await user.clear(total);
    await user.type(total, "999");
    expect(total).toHaveValue("999");

    // Editing paid no longer overwrites the manual total.
    await user.type(screen.getByLabelText(/paid fees/i), "5");
    expect(screen.getByLabelText(/total fees/i)).toHaveValue("999");

    // The reset control restores the paid + due value (10005 + 250).
    await user.click(screen.getByRole("button", { name: /use paid \+ due/i }));
    expect(screen.getByLabelText(/total fees/i)).toHaveValue("10255.00");
  });

  it("submits the entered values as minor units", async () => {
    const { user, onSubmit } = setup();

    await user.type(screen.getByLabelText(/customer name/i), "Asha Rao");
    await user.type(screen.getByLabelText(/mobile number/i), "98765 43210");
    await user.type(screen.getByLabelText(/paid fees/i), "1000");
    await user.type(screen.getByLabelText(/due fees/i), "250");
    await user.click(screen.getByRole("button", { name: /add customer/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const input = onSubmit.mock.calls[0][0] as CustomerInput;
    expect(input).toEqual({
      name: "Asha Rao",
      mobile: "9876543210",
      paidFees: 100000n,
      dueFees: 25000n,
      totalFees: 125000n,
    });
  });

  it("blocks submission and shows errors when required fields are missing", async () => {
    const { user, onSubmit } = setup();

    await user.click(screen.getByRole("button", { name: /add customer/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/enter the customer's name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a mobile number/i)).toBeInTheDocument();
  });

  it("rejects an implausibly short mobile number", async () => {
    const { user, onSubmit } = setup();

    await user.type(screen.getByLabelText(/customer name/i), "Asha");
    await user.type(screen.getByLabelText(/mobile number/i), "123");
    await user.click(screen.getByRole("button", { name: /add customer/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/enter a valid mobile number/i),
    ).toBeInTheDocument();
  });

  it("surfaces a save failure without navigating away", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("boom"));
    const { user } = setup(onSubmit);

    await user.type(screen.getByLabelText(/customer name/i), "Asha");
    await user.type(screen.getByLabelText(/mobile number/i), "9876543210");
    await user.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      await screen.findByText(/couldn't save the customer/i),
    ).toBeInTheDocument();
  });
});
