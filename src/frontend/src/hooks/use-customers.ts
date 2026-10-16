import { createActor } from "@/backend";
import type { Customer, CustomerInput, CustomerUpdate } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const customerKeys = {
  all: ["customers"] as const,
  list: () => [...customerKeys.all, "list"] as const,
  detail: (id: bigint) =>
    [...customerKeys.all, "detail", id.toString()] as const,
};

/** Fetch every customer record. */
export function useCustomers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Customer[]>({
    queryKey: customerKeys.list(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch a single customer by id. */
export function useCustomer(id: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Customer | null>({
    queryKey: customerKeys.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getCustomer(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/** Create a customer and refresh the list. */
export function useCreateCustomer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CustomerInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createCustomer(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

/** Update an existing customer and refresh affected queries. */
export function useUpdateCustomer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: CustomerUpdate }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateCustomer(id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

/** Delete a customer and refresh the list. */
export function useDeleteCustomer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteCustomer(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
