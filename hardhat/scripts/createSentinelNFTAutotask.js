const { AutotaskClient } = require("defender-autotask-client")
const { readFileSync, appendFileSync } = require("fs")

async function main() {
  require("dotenv").config()
  const {
    relayer: { relayerId },
  } = JSON.parse(readFileSync("./relay.json"))
  const { DEFENDER_TEAM_API: apiKey, DEFENDER_TEAM_SECRET: apiSecret } =
    process.env
  const client = new AutotaskClient({ apiKey, apiSecret })
  const { autotaskId } = await client.create({
    name: "link sentinel NFT Puppies",
    encodedZippedCode: await client.getEncodedZippedCodeFromFolder(
      "./build/relay"
    ),
    relayerId: relayerId,
    trigger: {
      type: "webhook",
    },
    paused: false,
  })
  console.log("Autotask created with ID ", autotaskId)
  appendFileSync(
    ".env",
    `\nPOLYGON_CHAINLINK_SNTL_AUTOTASK_ID="${autotaskId}"`,
    function (err) {
      if (err) throw err
    }
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
