const ethers = require("ethers")
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("defender-relay-client/lib/ethers")

const { ForwarderAbi } = require("../../src/forwarder")
const ForwarderAddress =
  require("../../deployCashoutPolygon.json").MinimalForwarder

async function relay(forwarder, request, signature, whitelist) {
  // Decide if we want to relay this request based on a whitelist
  const accepts = !whitelist || whitelist.includes(request.to)
  if (!accepts) throw new Error(`Rejected request to ${request.to}`)

  // Validate request on the forwarder contract
  const valid = await forwarder.verify(request, signature)
  if (!valid) throw new Error(`Invalid request`)

  // Send meta-tx through relayer to the forwarder contract
  const gasLimit = (parseInt(request.gas) + 50000).toString()
  const tx = await forwarder.execute(request, signature, { gasLimit })
  const reciept = await tx.wait(10)
  console.log(reciept)
  return reciept
}

async function handler(event) {
  // Parse webhook payload
  if (!event.request || !event.request.body) throw new Error(`Missing payload`)
  const { request, signature } = event.request.body
  console.log(`Relaying`, request, signature)

  // Initialize Relayer provider and signer, and forwarder contract
  const credentials = { ...event }
  const provider = new DefenderRelayProvider(credentials)
  const signer = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  })
  const forwarder = new ethers.Contract(ForwarderAddress, ForwarderAbi, signer)

  // Relay transaction!
  const tx = await relay(forwarder, request, signature)
  return { txHash: tx.confirmations }
}

module.exports = {
  handler,
  relay,
}
