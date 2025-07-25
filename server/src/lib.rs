use spacetimedb::{sats::u256, ReducerContext, Table};
use sha2::{Sha256, Digest};

#[spacetimedb::table(name = item, public)]
pub struct Item {
  #[primary_key]
  id: u256
}


  

#[spacetimedb::table(name = merkle_tree, public)]
pub struct MerkleTree {
  #[primary_key]
  id: u256,
  left: Option<u256>,
  right: Option<u256>
}


pub fn join_hashes(left: u256, right: u256) -> u256 {
  let mut hasher = Sha256::new();
  hasher.update(left.to_be_bytes());
  hasher.update(right.to_be_bytes());
  let result = hasher.finalize();
  u256::from_be_bytes(*result.as_ref())

}


#[spacetimedb::reducer]
pub fn add_item(ctx: &ReducerContext, id: u256) {
  ctx.db.item().insert(Item { id });
}

pub fn put_item(ctx: &ReducerContext, id: u256) {
  ctx.db.item().insert(Item { id });
}



#[spacetimedb::table(name = person)]
pub struct Person {
  name: String

}

#[spacetimedb::reducer(init)]
pub fn init(_ctx: &ReducerContext) {
  // Called when the module is initially published
}

#[spacetimedb::reducer(client_connected)]
pub fn identity_connected(_ctx: &ReducerContext) {
  // Called everytime a new client connects
}

#[spacetimedb::reducer(client_disconnected)]
pub fn identity_disconnected(_ctx: &ReducerContext) {
  // Called everytime a client disconnects
}

#[spacetimedb::reducer]
pub fn add(ctx: &ReducerContext, name: String) {
  ctx.db.person().insert(Person { name });
}

#[spacetimedb::reducer]
pub fn say_hello(ctx: &ReducerContext) {
  for person in ctx.db.person().iter() {
      log::info!("Hello, {}!", person.name);
  }
  log::info!("Hello, World!");
}
