'use strict';

var require$$0 = require('ethers');
var require$$1 = require('defender-relay-client/lib/ethers');
var require$$2 = require('defender-kvstore-client');

const ethers = require$$0;
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require$$1;

// const { puppiesABI } = require("../../src/puppies")
// const NFTAddress = require("../../deployCashoutPuppies.json").CashOutPuppies

const NFTAddress = "0xeA3103DFED86fb85b202cC80d05b14892608cbB3";
const puppiesABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function main(recipient, signer, storage) {
  const key = `NFT -airdrop-recipients/${NFTAddress}/${recipient}`;
  if (await storage.get(key)) {
    console.log(`address ${recipient} already recieved a puppy airdrop`);
    return
  }
  const contract = new ethers.Contract(NFTAddress, puppiesABI, signer);
  const tx = await contract.mint(recipient);
  await tx.wait(1);
  await storage.put(key, "minted");
  console.log(
    `transaction successfull with ${recipient}, the transaction receipt is ${tx.hash}`
  );
}
// entry point for autotask

async function handler(params) {
  const provider = new DefenderRelayProvider(params);
  const signer = new DefenderRelaySigner(params, provider, { speed: "fast" });
  const { KeyValueStoreClient } = require$$2;
  const storage = new KeyValueStoreClient(params);
  const [event] = params.request.body.matchReasons;
  const recipient = event.params.addressDeposited;

  await main(recipient, signer, storage);
}
var sentinelAutoTask = {
  handler,
};

module.exports = sentinelAutoTask;
