const { expect } = require("chai")
const { ethers } = require("hardhat")
const { readFileSync } = require("fs")

function getInstance(name) {
  const address = JSON.parse(readFileSync("deployCashoutPolygon.json"))[name]
  if (!address) throw new Error(`Contract ${name} not found in deploy.json`)
  return ethers.getContractFactory(name).then((f) => f.attach(address))
}
const { getPermitSignature } = require("../src/signer")
describe("ERC20Permit", function () {
  it("ERC20 permit", async function () {
    const contract = await getInstance("CashOutPolygon")
    const daiTokenAddress = JSON.parse(
      readFileSync("deployCashoutPolygon.json")
    )["DaiToken"]
    const token = await ethers
      .getContractFactory("Token")
      .then((f) => f.attach(daiTokenAddress))
    const accounts = await ethers.getSigners(2)
    const signer = accounts[0]
    const amount = ethers.utils.parseEther("223")
    console.log(await token.balanceOf(signer.address))

    const deadline = ethers.constants.MaxUint256
    const { v, r, s } = await getPermitSignature(
      signer,
      token,
      contract.address,
      amount,
      deadline
    )
    await contract.depositWithPermit(token.address, amount, deadline, v, r, s)
    const contractBalance = await token.balanceOf(contract.address)
    console.log(contractBalance)
    expect(contractBalance).to.eq(amount)
  })
})
