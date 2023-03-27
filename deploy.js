require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');



const provider = new HDWalletProvider(
  process.env.MNEMONIC_CODE,
  
  'https://goerli.infura.io/v3/c87ddb98e34041c690fd52ea034c45e2'
  
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('our interface is ', JSON.stringify(abi));
  console.log('Contract deployed to ', result.options.address);
  provider.engine.stop();
};
deploy();
