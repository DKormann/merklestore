
import { DbConnection, MerkleTree, HashPair} from "./module_bindings"
import { Writable } from "./store";


const dbname = "merklestore"
const servermode : 'local'|'remote' = (window.location.pathname.split("/").includes("local")) ? 'local' : 'remote';
const serverurl = (servermode == 'local') ? "ws://localhost:3000" : "wss://maincloud.spacetimedb.com";



export const globalCheck = new Writable<bigint>(0n)

export type proof =
({type:"pair"} & HashPair)|
{
  type: "node",
  id: bigint,
  left?: {check:bigint, proof:proof}
  right?: {check:bigint, proof:proof}
}

export async function getCheck(proof: proof): Promise<bigint> {
  const dataToHash: Uint8Array[] = [];


  if (proof.type === "node") {
    if (proof.left) {
      const leftCheck = proof.left.proof.type === "pair" ? proof.left.check : await getCheck(proof.left.proof);
      if (proof.left.proof.type === "node"){
        if (leftCheck != proof.left.check) throw new Error("Left check does not match")
      }
      dataToHash.push(bigIntToBytes(leftCheck));
    }
    if (proof.right) {
      const rightCheck = proof.right.proof.type === "pair" ? proof.right.check : await getCheck(proof.right.proof);
      if (proof.right.proof.type === "node"){
        if (rightCheck != proof.right.check) throw new Error("Right check does not match")
      }
      dataToHash.push(bigIntToBytes(rightCheck));
    }
    dataToHash.push(bigIntToBytes(proof.id));
  } else { dataToHash.push(bigIntToBytes(proof.check)); }

  const totalLength = dataToHash.reduce((sum, arr) => sum + arr.length, 0);
  const concatenated = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of dataToHash) {
    concatenated.set(arr, offset);
    offset += arr.length;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', concatenated);
  const hashArray = new Uint8Array(hashBuffer);
  return BigInt('0x' + Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join(''));
}

function bigIntToBytes(n: bigint): Uint8Array {
  const hex = n.toString(16).padStart(64, '0');
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}


function checkProofContainsNode(proof: proof, id: bigint): boolean {
  if (proof.type === "node"){
    if (proof.id == id) return true
    if (proof.left) if (checkProofContainsNode(proof.left.proof, id)) return true
    if (proof.right) if (checkProofContainsNode(proof.right.proof, id)) return true
  }
  return false
}

export const startDbConnection =()=>{


  return new Promise<{checkHash: (hash: bigint) => Promise<boolean>, storeHash: (hash:bigint) => Promise<void>}>((resolve, reject)=>{
  
    
    DbConnection.builder()
    .withUri(serverurl)
    .withModuleName(dbname)
    .onConnect(ctx=>{


      ctx.subscriptionBuilder()
      .onApplied(c=>{
        console.log(c.db.merkleTree.id.find(0n))
        c.db.merkleTree.onInsert((ctx, t)=>{
          findProof(0n, 0n).then(pro => getCheck(pro).then(check=>globalCheck.set(check)))
        })
      })
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



      const findProof = (root:bigint, id: bigint) => new Promise<proof>( (resolve, reject)=>{
        console.log("finding", root, id)
        ctx.subscriptionBuilder()
        .onApplied(async c=>{
          let tr = c.db.merkleTree.id.find(root)
          if (tr == undefined) return reject("Tree not found")

          let res:proof = {
            type: "node",
            id: tr.id,
            left: tr.left == undefined ? undefined : {check:tr.left.check, proof:{type:"pair", ...tr.left}},
            right: tr.right == undefined ? undefined : {check:tr.right.check, proof:{type:"pair", ...tr.right}}
          }
          if (tr.id > id){
            if (tr.left == undefined) return reject("Left child not found")
            res.left!.proof = await findProof(tr.left.id, id)
          }
          if (tr.id < id){
            if (tr.right == undefined) return reject("Right child not found")
            res.right!.proof = await findProof(tr.right.id, id)
          }
          resolve(res)
        })
        .subscribe(`SELECT * FROM merkle_tree WHERE id = ${root}`)
      })


      findProof(0n, 0n).then(pro => getCheck(pro).then(check=>globalCheck.set(check)))



      const storeHash = (hash: bigint) => new Promise<void>((resolve, reject)=>{
        ctx.reducers.onAddItem((ctx, id)=>{
          console.log(ctx.event.status);
          resolve()
        })
        ctx.reducers.addItem(hash)
        ctx.reducers.onAddTree((ctx, id)=>{
          console.log("Tree added",id);
          
          findProof(0n, id).then(pro=>{

            getCheck(pro).then(check=>{

              if (globalCheck.get() != check){
                alert("Global check does not match")
              }else{
                console.log("Global check matches")
              }
              if (!checkProofContainsNode(pro, id)){
                alert("Proof does not contain node")
              }
            })
            
          })
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


