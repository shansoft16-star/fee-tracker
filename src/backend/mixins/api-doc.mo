mixin () {
  /// Returns the backend's public API documentation as static Markdown.
  public query func getApiDoc() : async Text {
    let doc = "
# Customer Fees Backend API

This canister stores customer fee records. Each customer has a name, a mobile
number, paid fees, due fees, and total fees. Records persist across upgrades and
reloads.

## Data model

A `Customer` record has these fields:

| Field       | Type   | Meaning                                              |
| ----------- | ------ | ---------------------------------------------------- |
| `id`        | `Nat`  | Server-assigned identifier, unique and monotonically increasing. |
| `name`      | `Text` | Customer name. Required, non-blank.                  |
| `mobile`    | `Text` | Customer mobile number. Required, non-blank.         |
| `paidFees`  | `Nat`  | Amount already paid.                                 |
| `dueFees`   | `Nat`  | Amount still outstanding.                            |
| `totalFees` | `Nat`  | Total billed amount.                                 |
| `createdAt` | `Nat`  | Creation time in nanoseconds since the Unix epoch.   |

### Units and encoding

- **Money** (`paidFees`, `dueFees`, `totalFees`) is an integer in minor units
  (for example cents). It is never floating point. A value of `1250` means
  `12.50` in the display currency.
- **Timestamps** (`createdAt`) are nanoseconds since the Unix epoch, as a `Nat`.
- **Identifiers** (`id`) are `Nat` values assigned by the backend. They are not
  reused after deletion.
- Optional values are returned as Candid `opt`; absent records are `null`.

## Public methods

### `createCustomer(input : CustomerInput) : async Customer`

Creates a customer and returns the stored record with its assigned `id` and
`createdAt`. `CustomerInput` carries `name`, `mobile`, `paidFees`, `dueFees`,
and `totalFees`.

### `getCustomer(id : Nat) : async ?Customer`

Returns the customer with the given `id`, or `null` when no such record exists.

### `listCustomers() : async [Customer]`

Returns every customer record. Ordering is unspecified; sort client-side.

### `updateCustomer(id : Nat, input : CustomerUpdate) : async ?Customer`

Replaces all mutable fields of the customer with the given `id` and returns the
updated record. Returns `null` when no customer with that `id` exists. `id` and
`createdAt` are preserved.

### `deleteCustomer(id : Nat) : async Bool`

Deletes the customer with the given `id`. Returns `true` when a record was
removed and `false` when no such record existed.

### `getApiDoc() : async Text`

Returns this document.

## Authentication and authorization

All methods are callable by any caller, including anonymous callers. The
canister does not gate customer reads or writes on a signed-in identity, and it
does not scope records per user: every caller sees the same customer set.

The app's frontend pins an Internet Identity derivation origin, published at
`/.well-known/ii-derivation-origin` when available. An agent that already holds
the user's Internet Identity authorization derives the correct per-app principal
against that origin (for example `icp identity link web <name> --app <host>`).
Such a delegation acts with the user's full authority in this app until it
expires.

The canister also exposes an authorization mixin that manages roles. The first
caller to initialize access control receives the owner role; subsequent callers
receive the default role. Customer endpoints above do not consult those roles.

## Lifecycle and polling

- `createCustomer`, `updateCustomer`, and `deleteCustomer` are update calls and
  take effect only after the call completes successfully.
- `getCustomer`, `listCustomers`, and `getApiDoc` are query calls: they read the
  latest state but are not certified, so a client that needs a guaranteed-fresh
  read should poll after a mutation completes.
- There is no background processing, job queue, or asynchronous completion
  state. A successful mutation is immediately visible to subsequent reads.

## Mutation retry safety

- `createCustomer` is **not idempotent**. Retrying it creates a second customer
  with a new `id`. Do not retry blindly after a timeout; re-list customers to
  check whether the first attempt landed.
- `updateCustomer` is idempotent for a given `id` and input: applying the same
  update twice yields the same record.
- `deleteCustomer` is idempotent in effect: the first call returns `true`, a
  repeat returns `false`, and the record stays deleted either way.

## Errors, traps, and limits

- `createCustomer` and `updateCustomer` **trap** when `name` or `mobile` is
  blank (empty or whitespace only). A trap rejects the whole call and rolls back
  any state change; the caller receives an opaque reject with the message
  `Customer name is required` or `Customer mobile number is required`.
- `getCustomer` and `updateCustomer` return `null` rather than trapping when the
  `id` does not exist.
- Money fields are `Nat`; negative values cannot be represented and are rejected
  at the Candid boundary.
- There is no pagination. `listCustomers` returns the full set, so very large
  collections grow the response size.

## Non-obvious gotchas

- `totalFees` is stored as supplied and is **not** recomputed from
  `paidFees + dueFees`. The caller is responsible for keeping the three amounts
  consistent.
- `id` values are never reused, so an `id` from a deleted customer will not
  reappear.
- `createdAt` is set once at creation and never changes on update.
";
    doc;
  };
};
