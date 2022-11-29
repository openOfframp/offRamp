import { Mumbai } from "@usedapp/core"

export const DAPP_CONFIG = {
  readOnlyChainId: Mumbai.chainId,
  readOnlyUrls: {
    [Mumbai.chainId]: `https://neat-clean-pool.matic-testnet.discover.quiknode.pro/45c26e01961dc7f5bb4a3e7a99e16f4358774f61`,
  },
  noMetamaskDeactivate: true,
}
