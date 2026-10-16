import Map "mo:core/Map";
import Types "../types/customers";
import Common "../types/common";

module {
  /// Create a customer from input, assigning a fresh id and createdAt.
  public func create(
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    state : { var nextCustomerId : Nat },
    input : Types.CustomerInput,
    now : Common.Timestamp,
  ) : Types.Customer {
    let id = state.nextCustomerId;
    state.nextCustomerId := id + 1;
    let customer : Types.Customer = {
      id;
      name = input.name;
      mobile = input.mobile;
      paidFees = input.paidFees;
      dueFees = input.dueFees;
      totalFees = input.totalFees;
      createdAt = now;
    };
    customers.add(id, customer);
    customer;
  };

  /// Fetch a single customer by id.
  public func get(
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    id : Common.CustomerId,
  ) : ?Types.Customer {
    customers.get(id);
  };

  /// List all customers.
  public func list(
    customers : Map.Map<Common.CustomerId, Types.Customer>,
  ) : [Types.Customer] {
    customers.values().toArray();
  };

  /// Update an existing customer. Returns the updated record, or null if absent.
  public func update(
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    id : Common.CustomerId,
    input : Types.CustomerUpdate,
  ) : ?Types.Customer {
    switch (customers.get(id)) {
      case (?existing) {
        let updated : Types.Customer = {
          id = existing.id;
          name = input.name;
          mobile = input.mobile;
          paidFees = input.paidFees;
          dueFees = input.dueFees;
          totalFees = input.totalFees;
          createdAt = existing.createdAt;
        };
        customers.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Delete a customer. Returns true when a record was removed.
  public func remove(
    customers : Map.Map<Common.CustomerId, Types.Customer>,
    id : Common.CustomerId,
  ) : Bool {
    switch (customers.get(id)) {
      case (?_) {
        customers.remove(id);
        true;
      };
      case null { false };
    };
  };
};
