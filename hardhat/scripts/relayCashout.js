const { handler } = require("../autotasks/relay/index")

// Run autotask code locally using the Relayer API key and secret
if (require.main === module) {
  require("dotenv").config()
  const {
    POLYGON_RELAYER_API_KEY: apiKey,
    POLYGON_RELAYER_API_SECRET: apiSecret,
  } = process.env
  const payload = require("fs").readFileSync("tmp/requestCashoutPolygon.json")
  handler({ apiKey, apiSecret, request: { body: JSON.parse(payload) } })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
