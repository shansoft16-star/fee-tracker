import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types/customers";
import Common "../types/common";
import CustomersLib "../lib/customers";

mixin (
  customers : Map.Map<Common.CustomerId, Types.Customer>,
  state : { var nextCustomerId : Nat },
) {
  /// Create a customer. Returns the newly created record.
  public shared ({ caller }) func createCustomer(input : Types.CustomerInput) : async Types.Customer {
    ignore caller;
    if (input.name.trim(#char ' ') == "") {
      Runtime.trap("Customer name is required");
    };
    if (input.mobile.trim(#char ' ') == "") {
      Runtime.trap("Customer mobile number is required");
    };
    CustomersLib.create(customers, state, input, Time.now().toNat());
  };

  /// Fetch a single customer by id.
  public query func getCustomer(id : Common.CustomerId) : async ?Types.Customer {
    CustomersLib.get(customers, id);
  };

  /// List all customers.
  public query func listCustomers() : async [Types.Customer] {
    CustomersLib.list(customers);
  };

  /// Update an existing customer. Returns the updated record, or null if absent.
  public shared ({ caller }) func updateCustomer(id : Common.CustomerId, input : Types.CustomerUpdate) : async ?Types.Customer {
    ignore caller;
    if (input.name.trim(#char ' ') == "") {
      Runtime.trap("Customer name is required");
    };
    if (input.mobile.trim(#char ' ') == "") {
      Runtime.trap("Customer mobile number is required");
    };
    CustomersLib.update(customers, id, input);
  };

  /// Delete a customer. Returns true when a record was removed.
  public shared ({ caller }) func deleteCustomer(id : Common.CustomerId) : async Bool {
    ignore caller;
    CustomersLib.remove(customers, id);
  };
};
