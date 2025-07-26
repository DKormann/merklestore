
import { DbConnection, MerkleTree } from "./module_bindings"


const dbname = "merklestore"
const servermode : 'local'|'remote' = (window.location.pathname.split("/").includes("local")) ? 'local' : 'remote';
const serverurl = (servermode == 'local') ? "ws://localhost:3000" : "wss://maincloud.spacetimedb.com";




export type proof =
{
  type: "leaf",
  check: bigint,
} | {
  type: "node",
  id: bigint,
  check: bigint,
  left?: proof
  right?: proof 
}


export const startDbConnection =()=>{


  return new Promise<{checkHash: (hash: bigint) => Promise<boolean>, storeHash: (hash:bigint) => Promise<void>}>((resolve, reject)=>{
  
    
    DbConnection.builder()
    .withUri(serverurl)
    .withModuleName(dbname)
    .onConnect(ctx=>{


      ctx.subscriptionBuilder()
      .onApplied(c=>console.log(c.db.merkleTree.id.find(0n)))
      .onError(e=>console.error(e.event?.message))
      .subscribe(`SELECT * FROM merkle_tree WHERE id = 0`)

      const checkHash = (hash: bigint) => new Promise<boolean>((resolve, reject)=>{
        ctx.subscriptionBuilder()
        .onApplied(c=>resolve(c.db.item.id.find(hash)!=undefined))
        .onError(e=>{
          console.error(e.event?.message)
          reject(e.event?.message)
        })
        .subscribe(`SELECT * FROM item WHERE id = ${hash}`)
      })

      const findTree = (id: bigint) => new Promise<proof>( (resolve, reject)=>{
        console.log("finding", id)
        ctx.subscriptionBuilder()
        .onApplied(async c=>{
          let tr = c.db.merkleTree.id.find(id)
          if (tr == undefined) return reject("Tree not found")
          console.log("found", c.db.merkleTree.id.find(id));

          
          // let res:proof = {
          //   id: tr.id,
          //   check: tr.check,
          // }
          // if (tr.left != undefined) 
        })
        .onError(e=>reject(e.event?.message))
        .subscribe(`SELECT * FROM merkle_tree WHERE id = ${id}`)
      })

      const storeHash = (hash: bigint) => new Promise<void>((resolve, reject)=>{
        ctx.reducers.onAddItem((ctx, id)=>{
          console.log(ctx.event.status);
          resolve()
        })
        ctx.reducers.addItem(hash)
        ctx.reducers.onAddTree((ctx, id)=>{
          // ctx.subscriptionBuilder()
          // .onApplied(c=>{
          //   console.log(c.db.merkleTree.id.find(id))
          //   console.log(c.db.merkleTree.id.find(0n))
          // })
          // .onError(e=>console.error(e.event?.message))
          // .subscribe(
          //   [
          //     `SELECT * FROM merkle_tree WHERE id = ${id}`,
          //     `SELECT * FROM merkle_tree WHERE id = 0`,
          //   ]

          // )

          console.log("Tree added");
          
          findTree(0n).then(console.log)
          .catch(console.error)
          
        })

        ctx.reducers.addTree(hash)
      })
      resolve({checkHash:checkHash, storeHash:storeHash})
    })
    .onConnectError(e=>reject(e))
    .build()
  })


}


