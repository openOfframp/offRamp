const { ethers } = require("hardhat")
require("dotenv").config()
const { readFileSync } = require("fs")
async function main() {
  const usdtAddress = JSON.parse(readFileSync("deployCashoutBSC.json"))[
    "UsdtToken"
  ]
  const usdcAddress = JSON.parse(readFileSync("deployCashoutBSC.json"))[
    "UsdcToken"
  ]
  const usdtToken = await ethers
    .getContractFactory("Token")
    .then((f) => f.attach(usdtAddress))
  const usdcToken = await ethers
    .getContractFactory("Token")
    .then((f) => f.attach(usdcAddress))
  const from = "0x0FaF8Dbb2a7820E34D943aAc81D8Aef9A6e9d0B1"
  const from2 = "0xdB01d94217308046a792D864b16A35837aa52B86"
  const amount = ethers.utils.parseEther("1000")
  await usdtToken.mint(from, amount)
  await usdcToken.mint(from, amount)
  await usdtToken.mint(from2, amount)
  await usdcToken.mint(from2, amount)
  console.log(await usdcToken.balanceOf(from2))
  console.log(await usdtToken.balanceOf(from2))
}
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
