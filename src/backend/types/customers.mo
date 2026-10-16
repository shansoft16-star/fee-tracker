import Common "../types/common";

module {
  /// A customer fee record.
  /// `totalFees` is normally paid + due but may be overridden by the caller.
  public type Customer = {
    id : Common.CustomerId;
    name : Text;
    mobile : Text;
    paidFees : Common.Money;
    dueFees : Common.Money;
    totalFees : Common.Money;
    createdAt : Common.Timestamp;
  };

  /// Input for creating a customer. The backend assigns `id` and `createdAt`.
  public type CustomerInput = {
    name : Text;
    mobile : Text;
    paidFees : Common.Money;
    dueFees : Common.Money;
    totalFees : Common.Money;
  };

  /// Input for updating an existing customer. All fields are replaced.
  public type CustomerUpdate = {
    name : Text;
    mobile : Text;
    paidFees : Common.Money;
    dueFees : Common.Money;
    totalFees : Common.Money;
  };
};
