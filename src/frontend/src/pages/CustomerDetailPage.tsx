import { DeleteCustomerDialog } from "@/components/DeleteCustomerDialog";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import {
  formatMobile,
  formatMoney,
  initials,
  parseCustomerId,
} from "@/lib/format";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  Pencil,
  Phone,
  Wallet,
} from "lucide-react";

interface FeeRowProps {
  label: string;
  value: string;
  tone?: "default" | "success" | "destructive";
}

function FeeRow({ label, value, tone = "default" }: FeeRowProps) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-numeric text-base font-semibold ${toneClass}`}>
        {value}
      </span>
    </div>
  );
}

/** Customer detail view: all fee fields, payment status, and edit/delete actions. */
export function CustomerDetailPage() {
  const params = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const id = parseCustomerId(params.id);

  const customerQuery = useCustomer(id);
  const deleteCustomer = useDeleteCustomer();

  const backButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      data-ocid="customer_detail.back_button"
      onClick={() =>
        void navigate({
          to: "/customers",
          search: { q: undefined, sort: undefined, duesOnly: undefined },
        })
      }
      aria-label="Back to customers"
      className="rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
    </Button>
  );

  if (customerQuery.isLoading) {
    return (
      <Layout title="Customer" action={backButton}>
        <div data-ocid="customer_detail.loading_state" className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </Layout>
    );
  }

  const customer = customerQuery.data;

  if (!customer || id === undefined) {
    return (
      <Layout title="Customer" action={backButton}>
        <div
          data-ocid="customer_detail.error_state"
          className="rounded-2xl border border-border bg-card p-6 text-center shadow-subtle"
        >
          <h2 className="font-display text-lg font-semibold">
            Customer not found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This customer may have been deleted.
          </p>
          <Button
            type="button"
            data-ocid="customer_detail.back_to_list_button"
            onClick={() =>
              void navigate({
                to: "/customers",
                search: { q: undefined, sort: undefined, duesOnly: undefined },
              })
            }
            className="mt-4 h-11 rounded-full px-6 font-semibold"
          >
            Back to customers
          </Button>
        </div>
      </Layout>
    );
  }

  const settled = customer.dueFees === 0n;
  const customerId = id;

  async function handleDelete() {
    try {
      await deleteCustomer.mutateAsync(customerId);
      void navigate({
        to: "/customers",
        search: { q: undefined, sort: undefined, duesOnly: undefined },
      });
    } catch {
      // Keep the user on the page; the dialog can be retried.
    }
  }

  return (
    <Layout title="Customer" action={backButton}>
      <div data-ocid="customer_detail.page" className="space-y-5">
        <section
          data-ocid="customer_detail.card"
          className="animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-elevated"
        >
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground"
            >
              {initials(customer.name)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-semibold tracking-tight">
                {customer.name}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-numeric">
                  {formatMobile(customer.mobile)}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4">
            {settled ? (
              <span
                data-ocid="customer_detail.status_badge"
                className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-3 py-1 text-xs font-semibold text-success"
              >
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Settled
              </span>
            ) : (
              <span
                data-ocid="customer_detail.status_badge"
                className="inline-flex items-center gap-1.5 rounded-full bg-destructive/12 px-3 py-1 text-xs font-semibold text-destructive"
              >
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                Dues pending
              </span>
            )}
          </div>
        </section>

        <section
          data-ocid="customer_detail.fees_card"
          className="animate-fade-up rounded-2xl border border-border bg-card px-5 py-2 shadow-subtle"
        >
          <div className="flex items-center gap-2 border-b border-border py-3">
            <Wallet
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Fee breakdown
            </h3>
          </div>
          <div className="divide-y divide-border">
            <FeeRow
              label="Paid fees"
              value={formatMoney(customer.paidFees)}
              tone="success"
            />
            <FeeRow
              label="Due fees"
              value={formatMoney(customer.dueFees)}
              tone={settled ? "default" : "destructive"}
            />
            <FeeRow
              label="Total fees"
              value={formatMoney(customer.totalFees)}
            />
          </div>
        </section>

        <div className="space-y-3">
          <Button
            type="button"
            data-ocid="customer_detail.edit_button"
            onClick={() =>
              void navigate({
                to: "/customers/$id/edit",
                params: { id: customerId.toString() },
              })
            }
            className="h-12 w-full rounded-full text-base font-semibold active:scale-[0.98]"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit customer
          </Button>

          <DeleteCustomerDialog
            customerName={customer.name}
            onConfirm={handleDelete}
            disabled={deleteCustomer.isPending}
          />
        </div>
      </div>
    </Layout>
  );
}
