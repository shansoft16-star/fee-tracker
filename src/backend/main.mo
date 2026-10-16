import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Map "mo:core/Map";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import Types "types/customers";
import Common "types/common";
import CustomersApi "mixins/customers-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let customers : Map.Map<Common.CustomerId, Types.Customer>;
  let state : { var nextCustomerId : Nat };

  include MixinAuthorization(accessControlState, null);
  include CustomersApi(customers, state);
  include ApiDocMixin();
  include Expose({
    entities = [
      customers.toEntity("customer", "Customer", "id")
        .sample({
          id = 0;
          name = "";
          mobile = "";
          paidFees = 0;
          dueFees = 0;
          totalFees = 0;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
    ];
  });
};
