import BTS from './../BTS';
import {
    Apis
} from "bitsharesjs-ws";


var db2 = require('knex')({
  client: 'pg',
  // connection: {
  //   host : 'localhost',
  //   port: 5324,
  //   serevr:'postgres',
  //   user : 'postgres',
  //   password : 'postgres',
  //   database : 'bts_demo_1'
  // }
  //client: 'pg',
  connection: 'postgres://postgres:postgres@localhost:5432/bts_demo_1'
});

const task_table=[
  {
    task_id:'taskId01', 
    task_description:'Twitter', 
    amount:100000, // 1 BTS
    asset_id:'1.3.0'
  }
  
];

const fromAccount = '1.2.1639764' // ledger-nano2
// let toAccount = '1.2.1638270' //ledger-demo
// let amount = 300000 // 3 BTS
let tx=''
async function postTypeLedger(req, res) {
  const { task_id, user_account_name, notes } = req.body
  //const time_stamp_tx = new Date()
  //console.log(task_table[0].asset_id)
  let task_id_obj=task_table[0]
  try {
    tx=  await testLedger(task_id_obj,user_account_name,notes,res);
    console.log(tx)
  } catch (e) {
      console.log(e);
  }
          //add to the postgres db

    

}
async function testLedger(task_id_obj,user_account_name,notes,res) {
  console.log('Hi')
  let bts = new BTS();
  let toAccount = '1.2.1638270' //ledger-demo
  let asset_id_type=task_id_obj.asset_id;
  let amount=task_id_obj.amount;
  let result=''
  try {
      await bts.connect();
  } catch (e) {
      throw new Error('Could not connect to Ledger Nano. Check if connected.');
  }
  try {
      let key = await bts.getPublicKey("48'/1'/1'/0'/0'");
      console.log(key);
  } catch (e) {
      throw new Error('Could not retrieve public key.');
  }
  try {

      tx = await bts.prepareAndSignOp("48'/1'/1'/0'/0'", "transfer", {
          fee: {
              amount: 0,
              asset_id: asset_id_type
          },
          from: fromAccount,
          to: toAccount,
          amount: {
              amount: amount,
              asset_id:  asset_id_type
          }
      });
  } catch (e) {
      throw new Error(e);
  }

  try {
      await broadcastFunction(tx,task_id_obj,user_account_name,notes,res);
} catch (e) {
    throw new Error('Could not broadcast');
}


}

async function broadcastFunction(tx,task_id_obj,user_account_name,notes,res){
   Apis.instance()
  .network_api()
  .exec("broadcast_transaction_with_callback", [
      function (result) {
          
          insertIntoDemoTx(task_id_obj,user_account_name,notes,res,result)
          

      },
      tx
  ])
  .catch((e) => {
      throw new Error(e);
  });
}

function insertIntoDemoTx(task_id_obj,user_account_name,notes,res,result)
{
  //demo_tx_table
  //task_id, user_account_name, tx_id, amount, asset_type, notes,time_stamp_tx

  let task_id=task_id_obj.task_id
  let amount=task_id_obj.amount
  let asset_type=task_id_obj.asset_id
  let time_stamp_tx = new Date();
  let tx_id=''




  console.log(result[0].id)
  tx_id=result[0].id
   db2('demo_tx_table').insert({task_id, user_account_name, tx_id, amount, asset_type, notes, time_stamp_tx})
     //.returning('*')
     .then(
          item => {
            console.log('Insert complete')
            result.success=true
            res.json(result)
        }
        )
     .catch(
       
       err => {
        console.log(err)
         res.status(400).json({dbError: 'db error'})
       })
      }


      async function getAcctName(req, res) {
        console.log("Username is " + req.params.userAcct);
        let userAcct=req.params.userAcct;
        
        Apis.instance("wss://bts-seoul.clockwork.gr", true)
.init_promise.then(
  res1 => {
    console.log('connected')
    Apis.instance().db_api().exec("get_account_by_name",[userAcct])
    .then(
      result=>{
        console.log(result)
        res.json(result)
      }
    )
    .catch('Error')
  }
);
      }




        //"getAccount", fromAccount
      //   Apis.instance()
      //   .network_api()
      //   .exec("getAccount", [
      //       function (result) {
                
      //          // insertIntoDemoTx(task_id_obj,user_account_name,notes,res,result)
      //           console.log(result)
      
      //       },
      //       userAcct
      //   ])

      //   .catch((e) => {
      //       throw new Error(e);
      //   });
      //   //res.send("Username is " + req.params.userAcct);


      // }

module.exports = {
  postTypeLedger,
  getAcctName
}