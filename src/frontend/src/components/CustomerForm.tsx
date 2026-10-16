import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatMoney,
  isValidMobile,
  minorUnitsToInput,
  normalizeMobile,
  parseMoneyToMinorUnits,
} from "@/lib/format";
import type { CustomerInput, CustomerRecord } from "@/types";
import { Loader2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

interface CustomerFormProps {
  /** Existing record when editing; omit to create a new customer. */
  initial?: CustomerRecord;
  /** Persist the draft. Resolves on success, rejects to surface an error. */
  onSubmit: (input: CustomerInput) => Promise<unknown>;
  /** Label for the primary submit control. */
  submitLabel: string;
  /** Called after a successful save (e.g. navigate away). */
  onSaved?: () => void;
  /** Called when the user cancels the flow. */
  onCancel?: () => void;
}

interface FieldErrors {
  name?: string;
  mobile?: string;
  paid?: string;
  due?: string;
  total?: string;
}

const AMOUNT_PATTERN = /^\d*\.?\d{0,2}$/;

/** True when a typed amount is empty or a valid non-negative money string. */
function isAmountInput(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  return AMOUNT_PATTERN.test(trimmed);
}

/**
 * Add/edit form for a customer. Total fees auto-fills from paid + due while the
 * user types, but stops tracking once the user edits the total directly.
 */
export function CustomerForm({
  initial,
  onSubmit,
  submitLabel,
  onSaved,
  onCancel,
}: CustomerFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mobile, setMobile] = useState(initial?.mobile ?? "");
  const [paid, setPaid] = useState(
    initial ? minorUnitsToInput(initial.paidFees) : "",
  );
  const [due, setDue] = useState(
    initial ? minorUnitsToInput(initial.dueFees) : "",
  );
  const [total, setTotal] = useState(
    initial ? minorUnitsToInput(initial.totalFees) : "",
  );
  const [totalOverridden, setTotalOverridden] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const autoTotal = useMemo(() => {
    const paidMinor = parseMoneyToMinorUnits(paid);
    const dueMinor = parseMoneyToMinorUnits(due);
    return formatMoney(paidMinor + dueMinor);
  }, [paid, due]);

  function handlePaidChange(value: string) {
    setPaid(value);
    if (!totalOverridden) {
      const next = parseMoneyToMinorUnits(value) + parseMoneyToMinorUnits(due);
      setTotal(minorUnitsToInput(next));
    }
  }

  function handleDueChange(value: string) {
    setDue(value);
    if (!totalOverridden) {
      const next = parseMoneyToMinorUnits(paid) + parseMoneyToMinorUnits(value);
      setTotal(minorUnitsToInput(next));
    }
  }

  function handleTotalChange(value: string) {
    setTotal(value);
    setTotalOverridden(true);
  }

  function resetTotalToAuto() {
    setTotalOverridden(false);
    const next = parseMoneyToMinorUnits(paid) + parseMoneyToMinorUnits(due);
    setTotal(minorUnitsToInput(next));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (name.trim() === "") next.name = "Enter the customer's name.";
    if (mobile.trim() === "") {
      next.mobile = "Enter a mobile number.";
    } else if (!isValidMobile(mobile)) {
      next.mobile = "Enter a valid mobile number (7–15 digits).";
    }
    if (!isAmountInput(paid)) next.paid = "Enter a valid amount.";
    if (!isAmountInput(due)) next.due = "Enter a valid amount.";
    if (!isAmountInput(total)) next.total = "Enter a valid amount.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: CustomerInput = {
      name: name.trim(),
      mobile: normalizeMobile(mobile),
      paidFees: parseMoneyToMinorUnits(paid),
      dueFees: parseMoneyToMinorUnits(due),
      totalFees: parseMoneyToMinorUnits(total),
    };

    setSaving(true);
    try {
      await onSubmit(input);
      onSaved?.();
    } catch {
      setSubmitError("Couldn't save the customer. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      data-ocid="customer_form.form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-subtle">
        <div className="space-y-2">
          <Label
            htmlFor="customer-name"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Customer name
          </Label>
          <Input
            id="customer-name"
            data-ocid="customer_form.name_input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Asha Rao"
            autoComplete="name"
            enterKeyHint="next"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "customer-name-error" : undefined}
            className="h-12 rounded-xl text-base"
          />
          {errors.name ? (
            <p
              id="customer-name-error"
              data-ocid="customer_form.name_error"
              className="text-sm text-destructive"
            >
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="customer-mobile"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Mobile number
          </Label>
          <Input
            id="customer-mobile"
            data-ocid="customer_form.mobile_input"
            type="tel"
            inputMode="tel"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            placeholder="98765 43210"
            autoComplete="tel"
            enterKeyHint="next"
            aria-invalid={errors.mobile ? true : undefined}
            aria-describedby={
              errors.mobile ? "customer-mobile-error" : undefined
            }
            className="h-12 rounded-xl font-numeric text-base"
          />
          {errors.mobile ? (
            <p
              id="customer-mobile-error"
              data-ocid="customer_form.mobile_error"
              className="text-sm text-destructive"
            >
              {errors.mobile}
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-subtle">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-base font-semibold">Fees</h2>
          <span className="text-xs text-muted-foreground">
            Amounts in rupees
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label
              htmlFor="customer-paid"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Paid fees
            </Label>
            <Input
              id="customer-paid"
              data-ocid="customer_form.paid_input"
              inputMode="decimal"
              value={paid}
              onChange={(event) => handlePaidChange(event.target.value)}
              placeholder="0.00"
              enterKeyHint="next"
              aria-invalid={errors.paid ? true : undefined}
              aria-describedby={errors.paid ? "customer-paid-error" : undefined}
              className="h-12 rounded-xl font-numeric text-base"
            />
            {errors.paid ? (
              <p
                id="customer-paid-error"
                data-ocid="customer_form.paid_error"
                className="text-sm text-destructive"
              >
                {errors.paid}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="customer-due"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Due fees
            </Label>
            <Input
              id="customer-due"
              data-ocid="customer_form.due_input"
              inputMode="decimal"
              value={due}
              onChange={(event) => handleDueChange(event.target.value)}
              placeholder="0.00"
              enterKeyHint="next"
              aria-invalid={errors.due ? true : undefined}
              aria-describedby={errors.due ? "customer-due-error" : undefined}
              className="h-12 rounded-xl font-numeric text-base"
            />
            {errors.due ? (
              <p
                id="customer-due-error"
                data-ocid="customer_form.due_error"
                className="text-sm text-destructive"
              >
                {errors.due}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="customer-total"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Total fees
            </Label>
            {totalOverridden ? (
              <button
                type="button"
                data-ocid="customer_form.total_reset_button"
                onClick={resetTotalToAuto}
                className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
              >
                Use paid + due
              </button>
            ) : (
              <span
                data-ocid="customer_form.total_auto_hint"
                className="text-xs text-muted-foreground"
              >
                Auto · {autoTotal}
              </span>
            )}
          </div>
          <Input
            id="customer-total"
            data-ocid="customer_form.total_input"
            inputMode="decimal"
            value={total}
            onChange={(event) => handleTotalChange(event.target.value)}
            placeholder="0.00"
            enterKeyHint="done"
            aria-invalid={errors.total ? true : undefined}
            aria-describedby={errors.total ? "customer-total-error" : undefined}
            className="h-12 rounded-xl font-numeric text-base"
          />
          {errors.total ? (
            <p
              id="customer-total-error"
              data-ocid="customer_form.total_error"
              className="text-sm text-destructive"
            >
              {errors.total}
            </p>
          ) : null}
        </div>
      </section>

      {submitError ? (
        <p
          data-ocid="customer_form.error_state"
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          data-ocid="customer_form.submit_button"
          disabled={saving}
          className="h-12 w-full rounded-full text-base font-semibold active:scale-[0.98]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            data-ocid="customer_form.cancel_button"
            onClick={onCancel}
            disabled={saving}
            className="h-12 w-full rounded-full text-base font-semibold"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
