import type { Customer, CustomerInput, CustomerUpdate } from "@/types";
import { QueryClient } from "@tanstack/react-query";
import { vi } from "vitest";

/**
 * A typed in-memory stand-in for the generated `Backend` actor. It implements
 * exactly the customer methods the app's hooks call, so a test can assert on
 * observable behavior without a replica or a network call.
 */
export interface FakeActor {
  listCustomers: () => Promise<Customer[]>;
  getCustomer: (id: bigint) => Promise<Customer | null>;
  createCustomer: (input: CustomerInput) => Promise<Customer>;
  updateCustomer: (
    id: bigint,
    input: CustomerUpdate,
  ) => Promise<Customer | null>;
  deleteCustomer: (id: bigint) => Promise<boolean>;
}

export interface FakeActorState {
  customers: Customer[];
  nextId: bigint;
  /** When set, the next matching call rejects with this error. */
  failNext?: { method: keyof FakeActor; error: Error };
}

/** Build a customer record with sensible defaults for tests. */
export function makeCustomer(
  overrides: Partial<Customer> & { id: bigint },
): Customer {
  return {
    name: "Customer",
    mobile: "9876543210",
    paidFees: 0n,
    dueFees: 0n,
    totalFees: 0n,
    createdAt: 0n,
    ...overrides,
  };
}

/**
 * Create a fake actor backed by a mutable in-memory list. The returned `state`
 * is the same object the actor mutates, so tests can seed and inspect it.
 */
export function createFakeActor(seed: Customer[] = []): {
  actor: FakeActor;
  state: FakeActorState;
} {
  const state: FakeActorState = {
    customers: [...seed],
    nextId: seed.reduce((max, c) => (c.id >= max ? c.id + 1n : max), 0n),
  };

  function maybeFail(method: keyof FakeActor): void {
    if (state.failNext?.method === method) {
      const error = state.failNext.error;
      state.failNext = undefined;
      throw error;
    }
  }

  const actor: FakeActor = {
    listCustomers: async () => {
      maybeFail("listCustomers");
      return [...state.customers];
    },
    getCustomer: async (id) => {
      maybeFail("getCustomer");
      return state.customers.find((c) => c.id === id) ?? null;
    },
    createCustomer: async (input) => {
      maybeFail("createCustomer");
      const created: Customer = {
        id: state.nextId,
        name: input.name,
        mobile: input.mobile,
        paidFees: input.paidFees,
        dueFees: input.dueFees,
        totalFees: input.totalFees,
        createdAt: state.nextId,
      };
      state.nextId += 1n;
      state.customers.push(created);
      return created;
    },
    updateCustomer: async (id, input) => {
      maybeFail("updateCustomer");
      const index = state.customers.findIndex((c) => c.id === id);
      if (index === -1) return null;
      const updated: Customer = {
        ...state.customers[index],
        name: input.name,
        mobile: input.mobile,
        paidFees: input.paidFees,
        dueFees: input.dueFees,
        totalFees: input.totalFees,
      };
      state.customers[index] = updated;
      return updated;
    },
    deleteCustomer: async (id) => {
      maybeFail("deleteCustomer");
      const index = state.customers.findIndex((c) => c.id === id);
      if (index === -1) return false;
      state.customers.splice(index, 1);
      return true;
    },
  };

  return { actor, state };
}

/** A fresh QueryClient with retries disabled so failures surface immediately. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/** Convenience re-export so tests can build spies without importing vitest. */
export { vi };
