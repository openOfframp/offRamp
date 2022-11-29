const fetch = require("node-fetch")
const url = "http://localhost:5000/api/cashout"

async function main() {
  let request = {
    phoneNumber: 256779177900,
    intocurrency: 39000, // input the converted amount here
    currency: "UGX", // depends on the country currency
  }
  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
    headers: { "Content-Type": "application/json" },
  })
    .then(async (res) => {
      console.log(res)
    })
    .catch((error) => console.log(error))
    .finally(() => console.log("done"))
}
main()
