const { ethers } = require("hardhat")
const { writeFileSync, readFileSync } = require("fs")
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
  const usdcAddress = JSON.parse(readFileSync("deployCashoutPolygon.json"))[
    "UsdcToken"
  ]
  const usdtAddress = JSON.parse(readFileSync("deployCashoutPolygon.json"))[
    "UsdtToken"
  ]
  const daiAddress = JSON.parse(readFileSync("deployCashoutPolygon.json"))[
    "DaiToken"
  ]
  const Forwarder = await ethers.getContractFactory("MinimalForwarder")
  const forwarder = await Forwarder.connect(relaySigner)
    .deploy()
    .then((f) => f.deployed())

  const CashOut = await ethers.getContractFactory("CashOutPolygon")
  const cashout = await CashOut.connect(relaySigner)
    .deploy(forwarder.address)
    .then((f) => f.deployed())
  const usdtUSD = "0x92C09849638959196E976289418e5973CC96d645"
  const usdcUSD = "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0"
  const daiUSD = "0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046"
  await cashout.connect(relaySigner).addAllowedToken(usdtAddress, usdtUSD)
  await cashout.connect(relaySigner).addAllowedToken(usdcAddress, usdcUSD)
  await cashout.connect(relaySigner).addAllowedToken(daiAddress, daiUSD)
  writeFileSync(
    "deployCashoutPolygon.json",
    JSON.stringify(
      {
        MinimalForwarder: forwarder.address,
        CashOutPolygon: cashout.address,
        UsdcToken: usdcAddress,
        UsdtToken: usdtAddress,
        DaiToken: daiAddress,
      },
      null,
      2
    )
  )

  console.log(
    `MinimalForwarder: ${forwarder.address}\nCashOutPolygon: ${cashout.address}\nusdcTokenToken:${usdcAddress}\nusdtToken:${usdtAddress}\ndaiToken:${daiAddress} `
  )
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
