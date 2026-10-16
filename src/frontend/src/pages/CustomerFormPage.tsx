import { CustomerForm } from "@/components/CustomerForm";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateCustomer,
  useCustomer,
  useUpdateCustomer,
} from "@/hooks/use-customers";
import { parseCustomerId } from "@/lib/format";
import type { CustomerInput } from "@/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/**
 * Add/edit customer page. The `$id` route param switches the page into edit
 * mode; without it the form creates a new customer.
 */
export function CustomerFormPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();
  const hasIdParam = params.id !== undefined;
  const editingId = parseCustomerId(params.id);
  const isEditing = hasIdParam;
  const invalidId = hasIdParam && editingId === undefined;

  const customerQuery = useCustomer(editingId);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  function goBack() {
    if (isEditing && editingId !== undefined) {
      void navigate({
        to: "/customers/$id",
        params: { id: editingId.toString() },
      });
    } else {
      void navigate({
        to: "/customers",
        search: { q: undefined, sort: undefined, duesOnly: undefined },
      });
    }
  }

  async function handleSubmit(input: CustomerInput) {
    if (isEditing && editingId !== undefined) {
      await updateCustomer.mutateAsync({ id: editingId, input });
    } else {
      await createCustomer.mutateAsync(input);
    }
  }

  const backButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      data-ocid="customer_form.back_button"
      onClick={goBack}
      aria-label="Go back"
      className="rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
    </Button>
  );

  if (isEditing && !invalidId && customerQuery.isLoading) {
    return (
      <Layout title="Edit Customer" action={backButton} hideNav>
        <div data-ocid="customer_form.loading_state" className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </Layout>
    );
  }

  if (isEditing && (invalidId || !customerQuery.data)) {
    return (
      <Layout title="Edit Customer" action={backButton} hideNav>
        <div
          data-ocid="customer_form.error_state"
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
            data-ocid="customer_form.back_to_list_button"
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

  return (
    <Layout
      title={isEditing ? "Edit Customer" : "Add Customer"}
      action={backButton}
      hideNav
    >
      <div data-ocid="customer_form.page" className="animate-fade-up">
        <CustomerForm
          initial={customerQuery.data ?? undefined}
          submitLabel={isEditing ? "Save changes" : "Add customer"}
          onSubmit={handleSubmit}
          onSaved={goBack}
          onCancel={goBack}
        />
      </div>
    </Layout>
  );
}
