const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const {abi, evm} = require('../compile');

let accounts;
let lottery;

beforeEach(async()=>{
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
    .deploy({data: evm.bytecode.object})
    .send({gas:'1000000', from: accounts[0]})
});

describe('Lottery', ()=>{
    it('has a manager', ()=>{
        assert.ok(lottery.options.address);
    });

    it('can add player', async()=>{
       await lottery.methods.enter().send({
        from: accounts[0], value: web3.utils.toWei('0.02','ether')
       });

       const players = await lottery.methods.getPlayers().call({
        from: accounts[0]
       });

       assert.equal(accounts[0], players[0]);
       assert.equal(1, players.length);
    });
    
    it('can add multiple players', async()=>{
        await lottery.methods.enter().send({
         from: accounts[0], value: web3.utils.toWei('0.02','ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2], value: web3.utils.toWei('0.015','ether')
           });
        await lottery.methods.enter().send({
         from: accounts[1], value: web3.utils.toWei('0.03','ether')
        });   
 

        const players = await lottery.methods.getPlayers().call({
         from: accounts[0]
        });
 
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[2], players[1]);
        assert.equal(accounts[1], players[2]);
        assert.equal(3, players.length);
     });

     it('can check min ether to enter', async()=>{
        try{
        await lottery.methods.enter().send({
            from: accounts[0], value: 100
           });
           assert(false);
        } catch(err){
            assert(err);
        }
     });

     it('only manager can pick winner', async()=>{
        try{
        await lottery.methods.pickWinner().call({from: accounts[1]});
           assert(false);
        } catch(err){
            assert(err);
        }
     });

     it('pool prize', async()=>{
        await lottery.methods.enter().send({
            from:accounts[1], value:web3.utils.toWei('2', 'ether')
        })
        const prize = await lottery.methods.poolPrize().call({from:accounts[1]});
        console.log(prize);
        assert(true);
     });

     it('can send money to winner', async()=>{
        await lottery.methods.enter().send(
            {from:accounts[3], value : web3.utils.toWei('2', 'ether')
        });
        const initialBalance = await web3.eth.getBalance(accounts[3]);
        console.log('initialBalance is '+initialBalance);
        

        await lottery.methods.pickWinner().send({from: accounts[0]});

        

        const finalBalance = await web3.eth.getBalance(accounts[3]);
        const difference = finalBalance - initialBalance;
        console.log('final Balance is '+finalBalance);
        
        assert(difference > web3.utils.toWei('1.8', 'ether'));
     });

    });