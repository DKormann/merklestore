// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN YOUR MODULE SOURCE CODE INSTEAD.

// This was generated using spacetimedb cli version 1.2.0 (commit fb41e50eb73573b70eea532aeb6158eaac06fae0).

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import {
  AlgebraicType,
  AlgebraicValue,
  BinaryReader,
  BinaryWriter,
  ConnectionId,
  DbConnectionBuilder,
  DbConnectionImpl,
  Identity,
  ProductType,
  ProductTypeElement,
  SubscriptionBuilderImpl,
  SumType,
  SumTypeVariant,
  TableCache,
  TimeDuration,
  Timestamp,
  deepEqual,
  type CallReducerFlags,
  type DbContext,
  type ErrorContextInterface,
  type Event,
  type EventContextInterface,
  type ReducerEventContextInterface,
  type SubscriptionEventContextInterface,
} from "@clockworklabs/spacetimedb-sdk";

// Import and reexport all reducer arg types
import { Add } from "./add_reducer.ts";
export { Add };
import { AddItem } from "./add_item_reducer.ts";
export { AddItem };
import { AddTree } from "./add_tree_reducer.ts";
export { AddTree };
import { IdentityConnected } from "./identity_connected_reducer.ts";
export { IdentityConnected };
import { IdentityDisconnected } from "./identity_disconnected_reducer.ts";
export { IdentityDisconnected };
import { SayHello } from "./say_hello_reducer.ts";
export { SayHello };

// Import and reexport all table handle types
import { ItemTableHandle } from "./item_table.ts";
export { ItemTableHandle };
import { MerkleTreeTableHandle } from "./merkle_tree_table.ts";
export { MerkleTreeTableHandle };
import { PersonTableHandle } from "./person_table.ts";
export { PersonTableHandle };

// Import and reexport all types
import { HashPair } from "./hash_pair_type.ts";
export { HashPair };
import { Item } from "./item_type.ts";
export { Item };
import { MerkleTree } from "./merkle_tree_type.ts";
export { MerkleTree };
import { Person } from "./person_type.ts";
export { Person };

const REMOTE_MODULE = {
  tables: {
    item: {
      tableName: "item",
      rowType: Item.getTypeScriptAlgebraicType(),
      primaryKey: "id",
      primaryKeyInfo: {
        colName: "id",
        colType: Item.getTypeScriptAlgebraicType().product.elements[0].algebraicType,
      },
    },
    merkle_tree: {
      tableName: "merkle_tree",
      rowType: MerkleTree.getTypeScriptAlgebraicType(),
      primaryKey: "id",
      primaryKeyInfo: {
        colName: "id",
        colType: MerkleTree.getTypeScriptAlgebraicType().product.elements[0].algebraicType,
      },
    },
    person: {
      tableName: "person",
      rowType: Person.getTypeScriptAlgebraicType(),
    },
  },
  reducers: {
    add: {
      reducerName: "add",
      argsType: Add.getTypeScriptAlgebraicType(),
    },
    add_item: {
      reducerName: "add_item",
      argsType: AddItem.getTypeScriptAlgebraicType(),
    },
    add_tree: {
      reducerName: "add_tree",
      argsType: AddTree.getTypeScriptAlgebraicType(),
    },
    identity_connected: {
      reducerName: "identity_connected",
      argsType: IdentityConnected.getTypeScriptAlgebraicType(),
    },
    identity_disconnected: {
      reducerName: "identity_disconnected",
      argsType: IdentityDisconnected.getTypeScriptAlgebraicType(),
    },
    say_hello: {
      reducerName: "say_hello",
      argsType: SayHello.getTypeScriptAlgebraicType(),
    },
  },
  versionInfo: {
    cliVersion: "1.2.0",
  },
  // Constructors which are used by the DbConnectionImpl to
  // extract type information from the generated RemoteModule.
  //
  // NOTE: This is not strictly necessary for `eventContextConstructor` because
  // all we do is build a TypeScript object which we could have done inside the
  // SDK, but if in the future we wanted to create a class this would be
  // necessary because classes have methods, so we'll keep it.
  eventContextConstructor: (imp: DbConnectionImpl, event: Event<Reducer>) => {
    return {
      ...(imp as DbConnection),
      event
    }
  },
  dbViewConstructor: (imp: DbConnectionImpl) => {
    return new RemoteTables(imp);
  },
  reducersConstructor: (imp: DbConnectionImpl, setReducerFlags: SetReducerFlags) => {
    return new RemoteReducers(imp, setReducerFlags);
  },
  setReducerFlagsConstructor: () => {
    return new SetReducerFlags();
  }
}

// A type representing all the possible variants of a reducer.
export type Reducer = never
| { name: "Add", args: Add }
| { name: "AddItem", args: AddItem }
| { name: "AddTree", args: AddTree }
| { name: "IdentityConnected", args: IdentityConnected }
| { name: "IdentityDisconnected", args: IdentityDisconnected }
| { name: "SayHello", args: SayHello }
;

export class RemoteReducers {
  constructor(private connection: DbConnectionImpl, private setCallReducerFlags: SetReducerFlags) {}

  add(name: string) {
    const __args = { name };
    let __writer = new BinaryWriter(1024);
    Add.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("add", __argsBuffer, this.setCallReducerFlags.addFlags);
  }

  onAdd(callback: (ctx: ReducerEventContext, name: string) => void) {
    this.connection.onReducer("add", callback);
  }

  removeOnAdd(callback: (ctx: ReducerEventContext, name: string) => void) {
    this.connection.offReducer("add", callback);
  }

  addItem(id: bigint) {
    const __args = { id };
    let __writer = new BinaryWriter(1024);
    AddItem.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("add_item", __argsBuffer, this.setCallReducerFlags.addItemFlags);
  }

  onAddItem(callback: (ctx: ReducerEventContext, id: bigint) => void) {
    this.connection.onReducer("add_item", callback);
  }

  removeOnAddItem(callback: (ctx: ReducerEventContext, id: bigint) => void) {
    this.connection.offReducer("add_item", callback);
  }

  addTree(id: bigint) {
    const __args = { id };
    let __writer = new BinaryWriter(1024);
    AddTree.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("add_tree", __argsBuffer, this.setCallReducerFlags.addTreeFlags);
  }

  onAddTree(callback: (ctx: ReducerEventContext, id: bigint) => void) {
    this.connection.onReducer("add_tree", callback);
  }

  removeOnAddTree(callback: (ctx: ReducerEventContext, id: bigint) => void) {
    this.connection.offReducer("add_tree", callback);
  }

  onIdentityConnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.onReducer("identity_connected", callback);
  }

  removeOnIdentityConnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.offReducer("identity_connected", callback);
  }

  onIdentityDisconnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.onReducer("identity_disconnected", callback);
  }

  removeOnIdentityDisconnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.offReducer("identity_disconnected", callback);
  }

  sayHello() {
    this.connection.callReducer("say_hello", new Uint8Array(0), this.setCallReducerFlags.sayHelloFlags);
  }

  onSayHello(callback: (ctx: ReducerEventContext) => void) {
    this.connection.onReducer("say_hello", callback);
  }

  removeOnSayHello(callback: (ctx: ReducerEventContext) => void) {
    this.connection.offReducer("say_hello", callback);
  }

}

export class SetReducerFlags {
  addFlags: CallReducerFlags = 'FullUpdate';
  add(flags: CallReducerFlags) {
    this.addFlags = flags;
  }

  addItemFlags: CallReducerFlags = 'FullUpdate';
  addItem(flags: CallReducerFlags) {
    this.addItemFlags = flags;
  }

  addTreeFlags: CallReducerFlags = 'FullUpdate';
  addTree(flags: CallReducerFlags) {
    this.addTreeFlags = flags;
  }

  sayHelloFlags: CallReducerFlags = 'FullUpdate';
  sayHello(flags: CallReducerFlags) {
    this.sayHelloFlags = flags;
  }

}

export class RemoteTables {
  constructor(private connection: DbConnectionImpl) {}

  get item(): ItemTableHandle {
    return new ItemTableHandle(this.connection.clientCache.getOrCreateTable<Item>(REMOTE_MODULE.tables.item));
  }

  get merkleTree(): MerkleTreeTableHandle {
    return new MerkleTreeTableHandle(this.connection.clientCache.getOrCreateTable<MerkleTree>(REMOTE_MODULE.tables.merkle_tree));
  }

  get person(): PersonTableHandle {
    return new PersonTableHandle(this.connection.clientCache.getOrCreateTable<Person>(REMOTE_MODULE.tables.person));
  }
}

export class SubscriptionBuilder extends SubscriptionBuilderImpl<RemoteTables, RemoteReducers, SetReducerFlags> { }

export class DbConnection extends DbConnectionImpl<RemoteTables, RemoteReducers, SetReducerFlags> {
  static builder = (): DbConnectionBuilder<DbConnection, ErrorContext, SubscriptionEventContext> => {
    return new DbConnectionBuilder<DbConnection, ErrorContext, SubscriptionEventContext>(REMOTE_MODULE, (imp: DbConnectionImpl) => imp as DbConnection);
  }
  subscriptionBuilder = (): SubscriptionBuilder => {
    return new SubscriptionBuilder(this);
  }
}

export type EventContext = EventContextInterface<RemoteTables, RemoteReducers, SetReducerFlags, Reducer>;
export type ReducerEventContext = ReducerEventContextInterface<RemoteTables, RemoteReducers, SetReducerFlags, Reducer>;
export type SubscriptionEventContext = SubscriptionEventContextInterface<RemoteTables, RemoteReducers, SetReducerFlags>;
export type ErrorContext = ErrorContextInterface<RemoteTables, RemoteReducers, SetReducerFlags>;
