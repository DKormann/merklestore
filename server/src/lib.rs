use spacetimedb::{sats::u256, ReducerContext, Table};
use sha2::{Sha256, Digest};
// use primitive_types::U256;
use ethnum::U256;

#[spacetimedb::table(name = item, public)]
pub struct Item {
  #[primary_key]
  id: u256
}

  

#[spacetimedb::table(name = merkle_tree, public)]
pub struct MerkleTree {
  #[primary_key]
  id: u256,
  check: u256,
  left: Option<u256>,
  right: Option<u256>
}



#[spacetimedb::reducer]
pub fn add_item(ctx: &ReducerContext, id: u256) {
  ctx.db.item().insert(Item { id });
}

pub fn put_item(ctx: &ReducerContext, id: u256) {
  ctx.db.item().insert(Item { id });
}


#[spacetimedb::reducer]
pub fn add_tree(ctx:&ReducerContext, id: u256){

  let tree = MerkleTree {
    id,
    check: id,
    left: None,
    right: None
  };
  let tree = ctx.db.merkle_tree().insert(tree);
  update_tree(ctx, u256::from(0u8), tree);
}

pub fn update_tree(ctx: &ReducerContext, root: u256, tree:MerkleTree) -> u256 {
  let mut parent = ctx.db.merkle_tree().id().find(root).unwrap();
  let id = tree.id;
  let mut hash = Sha256::new();
  let mut hash_update = |id:u256| {
    hash.update(id.to_be_bytes());
  };
  if parent.id > id{
    let left_hash =match parent.left {
      None => {
        parent.left = Some(id);
        id }
      Some(next_id) => { update_tree(ctx, next_id, tree) }
    };
    hash_update(left_hash);
    if let Some(right) = parent.right {
      hash_update(ctx.db.merkle_tree().id().find(right).unwrap().check);
    }
  } else {
    if let Some(left) = parent.left {
      hash_update(ctx.db.merkle_tree().id().find(left).unwrap().check);
    }
    let right_hash = match parent.right {
      None => {
        parent.right = Some(id);
        id}
      Some(next_id)=> { update_tree(ctx, next_id, tree)}
    };
    hash_update(right_hash);
  };

  hash.update( parent.id.to_be_bytes());
  let result = hash.finalize();
  parent.check = u256::from_be_bytes(*result.as_ref());
  ctx.db.merkle_tree().id().update(parent).check

}


#[spacetimedb::table(name = person)]
pub struct Person {
  name: String

}



#[spacetimedb::reducer(init)]
pub fn init(_ctx: &ReducerContext) {
  // Called when the module is initially published
  _ctx.db.merkle_tree().insert(MerkleTree {
    id: U256::from(0u8),
    check: U256::from(0u8),
    left: None, right: None });
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
