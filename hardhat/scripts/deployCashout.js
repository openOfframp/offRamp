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
  const Token = await ethers.getContractFactory("DaiContract")
  const daiToken = await Token.deploy("DAI", "DAI").then((f) => f.deployed())
  const TokenContract = await ethers.getContractFactory("Token")
  const usdtToken = await TokenContract.deploy("USDT", "USDT").then((f) =>
    f.deployed()
  )
  const usdcToken = await TokenContract.deploy("USDC", "USDC").then((f) =>
    f.deployed()
  )
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
  await cashout.connect(relaySigner).addAllowedToken(usdtToken.address, usdtUSD)
  await cashout.connect(relaySigner).addAllowedToken(usdcToken.address, usdcUSD)
  await cashout.connect(relaySigner).addAllowedToken(daiToken.address, daiUSD)
  const amount = ethers.utils.parseEther("100000000")
  const { PRIVATE_KEY: signer } = process.env
  const to = new ethers.Wallet(signer).address
  await daiToken.mint(to, amount)
  await usdcToken.mint(to, amount)
  await usdtToken.mint(to, amount)
  writeFileSync(
    "deployCashoutPolygon.json",
    JSON.stringify(
      {
        MinimalForwarder: forwarder.address,
        CashOut: cashout.address,
        UsdcToken: usdcToken.address,
        UsdtToken: usdtToken.address,
        DaiToken: daiToken.address,
      },
      null,
      2
    )
  )

  console.log(
    `MinimalForwarder: ${forwarder.address}\nCashout: ${cashout.address}\nusdcTokenToken:${usdcToken.address}\nusdtToken:${usdtToken.address}\ndaiToken:${daiToken.address} `
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
