const { ethers } = require("hardhat")
const { writeFileSync } = require("fs")
const {
  DefenderRelayProvider,
  DefenderRelaySigner,
} = require("defender-relay-client/lib/ethers")
require("dotenv").config()
const credentials = {
  apiKey: process.env.POLYGON_RELAYER_API_KEY,
  apiSecret: process.env.POLYGON_RELAYER_API_SECRET,
}
const provider = new DefenderRelayProvider(credentials)
const relaySigner = new DefenderRelaySigner(credentials, provider, {
  speed: "fast",
})

async function main() {
  const Puppies = await ethers.getContractFactory("CashOutPuppies")
  const puppies = await Puppies.connect(relaySigner)
    .deploy()
    .then((f) => f.deployed())

  writeFileSync(
    "deployCashoutPuppies.json",
    JSON.stringify(
      {
        CashOutPuppies: puppies.address,
      },
      null,
      2
    )
  )

  console.log(`Puppies: ${puppies.address} `)
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
