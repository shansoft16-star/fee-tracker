import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface Customer {
    id: CustomerId;
    name: string;
    createdAt: Timestamp;
    dueFees: Money;
    totalFees: Money;
    paidFees: Money;
    mobile: string;
}
export type CustomerId = bigint;
export interface CustomerInput {
    name: string;
    dueFees: Money;
    totalFees: Money;
    paidFees: Money;
    mobile: string;
}
export interface CustomerUpdate {
    name: string;
    dueFees: Money;
    totalFees: Money;
    paidFees: Money;
    mobile: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type Money = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create a customer. Returns the newly created record.
     */
    createCustomer(input: CustomerInput): Promise<Customer>;
    /**
     * / Delete a customer. Returns true when a record was removed.
     */
    deleteCustomer(id: CustomerId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Returns the backend's public API documentation as static Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Fetch a single customer by id.
     */
    getCustomer(id: CustomerId): Promise<Customer | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List all customers.
     */
    listCustomers(): Promise<Array<Customer>>;
    schema(): Promise<string>;
    /**
     * / Update an existing customer. Returns the updated record, or null if absent.
     */
    updateCustomer(id: CustomerId, input: CustomerUpdate): Promise<Customer | null>;
}
