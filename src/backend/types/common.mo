module {
  /// Unique identifier for a customer record.
  public type CustomerId = Nat;

  /// Wall-clock timestamp in nanoseconds since the Unix epoch.
  public type Timestamp = Nat;

  /// Money amount in integer minor units (e.g. cents). Never floating point.
  public type Money = Nat;
};
