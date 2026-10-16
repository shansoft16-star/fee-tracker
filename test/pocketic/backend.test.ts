import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listCustomers()).resolves.toEqual([]);
});

it("round-trips a customer through the real canister", async () => {
  const created = await actor.createCustomer({
    name: "Asha Rao",
    mobile: "9876543210",
    paidFees: 100000n,
    dueFees: 25000n,
    totalFees: 125000n,
  });

  expect(created.name).toBe("Asha Rao");
  expect(created.mobile).toBe("9876543210");
  expect(created.paidFees).toBe(100000n);
  expect(created.dueFees).toBe(25000n);
  expect(created.totalFees).toBe(125000n);

  const fetched = await actor.getCustomer(created.id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0]).toMatchObject({ id: created.id, name: "Asha Rao" });

  const listed = await actor.listCustomers();
  expect(listed).toHaveLength(1);
  expect(listed[0].id).toBe(created.id);
});

it("updates an existing customer and reflects the new values", async () => {
  const created = await actor.createCustomer({
    name: "Before",
    mobile: "9000000000",
    paidFees: 1000n,
    dueFees: 2000n,
    totalFees: 3000n,
  });

  const updated = await actor.updateCustomer(created.id, {
    name: "After",
    mobile: "9111111111",
    paidFees: 5000n,
    dueFees: 0n,
    totalFees: 5000n,
  });

  expect(updated).toHaveLength(1);
  expect(updated[0]).toMatchObject({
    id: created.id,
    name: "After",
    mobile: "9111111111",
    paidFees: 5000n,
    dueFees: 0n,
    totalFees: 5000n,
  });

  const fetched = await actor.getCustomer(created.id);
  expect(fetched[0]?.name).toBe("After");
});

it("deletes a customer and reports absence afterwards", async () => {
  const created = await actor.createCustomer({
    name: "Temporary",
    mobile: "9222222222",
    paidFees: 0n,
    dueFees: 0n,
    totalFees: 0n,
  });

  await expect(actor.deleteCustomer(created.id)).resolves.toBe(true);
  await expect(actor.getCustomer(created.id)).resolves.toEqual([]);
  await expect(actor.deleteCustomer(created.id)).resolves.toBe(false);
});

it("rejects a customer with a blank name", async () => {
  await expect(
    actor.createCustomer({
      name: "   ",
      mobile: "9333333333",
      paidFees: 0n,
      dueFees: 0n,
      totalFees: 0n,
    }),
  ).rejects.toThrow();
});

it("rejects a customer with a blank mobile number", async () => {
  await expect(
    actor.createCustomer({
      name: "No Mobile",
      mobile: "  ",
      paidFees: 0n,
      dueFees: 0n,
      totalFees: 0n,
    }),
  ).rejects.toThrow();
});

it("keeps records across a canister upgrade", async () => {
  const created = await actor.createCustomer({
    name: "Persistent",
    mobile: "9444444444",
    paidFees: 7000n,
    dueFees: 3000n,
    totalFees: 10000n,
  });

  await pic!.upgradeCanister({
    canisterId,
    wasm: BACKEND_WASM,
    upgradeModeOptions: { skip_pre_upgrade: [], wasm_memory_persistence: [{ keep: null }] },
  });

  const upgraded = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  const fetched = await upgraded.getCustomer(created.id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0]).toMatchObject({
    name: "Persistent",
    paidFees: 7000n,
    dueFees: 3000n,
    totalFees: 10000n,
  });
});
