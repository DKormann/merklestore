
import { DbConnection } from "./module_bindings"


const dbname = "merklestore"
const servermode : 'local'|'remote' = (window.location.pathname.split("/").includes("local")) ? 'local' : 'remote';
const serverurl = (servermode == 'local') ? "ws://localhost:3000" : "wss://maincloud.spacetimedb.com";



export const startDbConnection =()=>{


  return new Promise<{checkHash: (hash: bigint) => Promise<boolean>, storeHash: (hash:bigint) => Promise<void>}>((resolve, reject)=>{

    
    DbConnection.builder()
    .withUri(serverurl)
    .withModuleName(dbname)
    .onConnect(ctx=>{

      const checkHash = (hash: bigint) => new Promise<boolean>((resolve, reject)=>{
        ctx.subscriptionBuilder()
        .onApplied(c=>resolve(c.db.item.id.find(hash)!=undefined))
        .onError(e=>{
          console.error(e.event?.message)
          reject(e.event?.message)
        })
        .subscribe(`SELECT * FROM item WHERE id = ${hash}`)
      })

      const storeHash = (hash: bigint) => new Promise<void>((resolve, reject)=>{
        ctx.reducers.onAddItem((ctx, id)=>{
          console.log(ctx.event.status);
          
          resolve()
        })
        ctx.reducers.addItem(hash)
      })
      resolve({checkHash:checkHash, storeHash:storeHash})
    })
    .onConnectError(e=>reject(e))
    .build()
  })


}


