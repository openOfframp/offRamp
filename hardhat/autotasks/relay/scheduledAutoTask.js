const ethers = require("ethers")
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("defender-relay-client/lib/ethers")

const { cashoutABI } = require("../../src/cashoutAbi")
const cashoutAddress = require("../../deployCashoutPolygon.json").CashOutPolygon

async function handler(credentials) {
  const provider = new DefenderRelayProvider(credentials)
  const signer = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  })
  const contract = new ethers.Contract(cashoutAddress, cashoutABI, signer)
  console.log(cashoutAddress)
  const count = await contract.getAddressLength()
  const to = "0xdB01d94217308046a792D864b16A35837aa52B86"
  for (let i = 0; i < count; i++) {
    let token = await contract.allowedTokensAddresses(i)
    const canWithdraw = await contract.tokenTriggerAmountReached(token)
    if (canWithdraw) {
      const tx = await contract.withdrawToken(to, token)
      tx.wait(5)
      console.log(
        `withdraw transaction  of ${token} executed, checkout ${tx.hash} for details`
      )
    } else {
      console.log(`balance not yet sufficient for ${token} token`)
    }
  }
}

module.exports = {
  handler,
}
