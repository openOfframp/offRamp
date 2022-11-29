const { ethers } = require("hardhat")
const { expect } = require("chai")
const { readFileSync } = require("fs")

require("dotenv").config()

function getInstance(name) {
  const address = JSON.parse(readFileSync("deployCashoutPolygon.json"))[name]
  if (!address) throw new Error(`Contract ${name} not found in deploy.json`)
  return ethers.getContractFactory(name).then((f) => f.attach(address))
}

describe("CashOut", async () => {
  it("getAddressLenght", async () => {
    const mainContract = await getInstance("CashOutPolygon")

    const length = await mainContract.getAddressLength()
    const x = await mainContract.minimumTokenDepositAmount(
      "0x94fa611d6fc3e7d58b7b9d30a9f7cb3f36b5a830"
    )
    const y = await mainContract.triggerTokenWithdrawAmount(
      "0x94fa611d6fc3e7d58b7b9d30a9f7cb3f36b5a830"
    )
    const z = await mainContract.maximumTokenDepositAmount(
      "0x94fa611d6fc3e7d58b7b9d30a9f7cb3f36b5a830"
    )
    const w = ethers.utils.parseEther("15")
    console.log(`minimum ${x}\n trigger ${y}\n maximum ${z}`)
    expect(length).to.equal(3)
    expect(z).to.be.greaterThan(w)
  })
})
