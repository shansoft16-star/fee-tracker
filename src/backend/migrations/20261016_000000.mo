import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  type CustomerId = Nat;
  type Timestamp = Nat;
  type Money = Nat;

  type Customer = {
    id : CustomerId;
    name : Text;
    mobile : Text;
    paidFees : Money;
    dueFees : Money;
    totalFees : Money;
    createdAt : Timestamp;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    customers : Map.Map<CustomerId, Customer>;
    state : { var nextCustomerId : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      customers = Map.empty();
      state = { var nextCustomerId = 0 };
    };
  };
};
