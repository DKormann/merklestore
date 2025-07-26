use spacetimedb::{sats::u256, spacetimedb_lib::Hash, ReducerContext, SpacetimeType, Table};
use sha2::{Sha256, Digest};
// use primitive_types::U256;
use ethnum::U256;

#[spacetimedb::table(name = item, public)]
pub struct Item {
  #[primary_key]
  id: u256
}

#[derive(SpacetimeType)]
pub struct HashPair {
  pub id: u256,
  pub check: u256
}

#[spacetimedb::table(name = merkle_tree, public)]
pub struct MerkleTree {
  #[primary_key]
  id: u256,
  left: Option<HashPair>,
  right: Option<HashPair>
}



impl MerkleTree {
  pub fn getcheck(&self) -> u256 {
    let mut hash = Sha256::new();
    self.left.as_ref().map(|x| hash.update(x.check.to_be_bytes()));
    self.right.as_ref().map(|x| hash.update(x.check.to_be_bytes()));
    hash.update(self.id.to_be_bytes());
    let result = hash.finalize();
    u256::from_be_bytes(*result.as_ref())
  }
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

  if ctx.db.merkle_tree().id().find(id).is_some() {
    return;
  }

  let tree = MerkleTree {
    id,
    left: None,
    right: None
  };
  let tree = ctx.db.merkle_tree().insert(tree);
  update_tree(ctx, u256::from(0u8), HashPair { id: tree.id, check: tree.getcheck() });
}


pub fn update_tree(ctx: &ReducerContext, root: u256, newtree:HashPair)->HashPair{
  
  let mut parent = ctx.db.merkle_tree().id().find(root).unwrap();
  let id = newtree.id;
  if parent.id > id{
    parent.left = Some(match parent.left{
      None =>{ newtree }
      Some(next_id) => { update_tree(ctx, next_id.id, newtree) }
    });
  }else{
    parent.right = Some(match parent.right{
      None => { newtree}
      Some(next_id) => { update_tree(ctx, next_id.id, newtree) }
    });
  };
  parent = ctx.db.merkle_tree().id().update(parent);
  return HashPair { id: parent.id,  check: parent.getcheck() }
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
    left: None,
    right: None
});
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
