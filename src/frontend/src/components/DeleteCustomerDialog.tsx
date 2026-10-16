import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

interface DeleteCustomerDialogProps {
  /** Customer name shown in the confirmation copy. */
  customerName: string;
  /** Runs the delete. Resolves on success, rejects to surface an error. */
  onConfirm: () => Promise<unknown>;
  /** Optional custom trigger; defaults to a destructive "Delete" button. */
  trigger?: ReactNode;
  /** Disable the trigger while another action is in flight. */
  disabled?: boolean;
}

/**
 * Confirmation dialog guarding customer deletion. The destructive action only
 * fires after an explicit confirm.
 */
export function DeleteCustomerDialog({
  customerName,
  onConfirm,
  trigger,
  disabled = false,
}: DeleteCustomerDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="destructive"
            data-ocid="customer_detail.delete_button"
            disabled={disabled}
            className="h-12 w-full rounded-full text-base font-semibold active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete customer
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent
        data-ocid="delete_customer.dialog"
        className="rounded-2xl"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            Delete {customerName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This removes the customer and their fee record permanently. This
            action can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="delete_customer.cancel_button"
            className="h-11 rounded-full"
          >
            Keep customer
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="delete_customer.confirm_button"
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
            className="h-11 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
