import React from "react"
import { useEthers } from "@usedapp/core"
import { ToastContainer } from "react-toastify"
import styles from "./styles"
import { four, Logo, three, two, one } from "./assets"
import { Exchange, Loader, WalletButton, Networks, History } from "./components"

const App = () => {
  const { account } = useEthers()

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div class={styles.subheader}>
          <p class=''> ⚡ SWAP CRYPTO FOR FIAT AND EARN A CASHOUT PUPPY ⚡ </p>
        </div>
        <header className={styles.header}>
          <img
            src={Logo}
            alt='CashOut-logo'
            className='w-50 h-20 object-contain'
          />
          {account ? (
            <>
              <div className={styles.Rheader}>
                <Networks />
                <WalletButton />
                <History />
              </div>
            </>
          ) : (
            <WalletButton />
          )}
        </header>
        <div className={styles.exchangeContainer}>
          <h1 className={styles.headTitle}>CashOut 2.0</h1>
          <p className={styles.subTitle}>Sell your Cryptos in seconds</p>
        </div>
        <div className={styles.sideBySide}>
          <div className={styles.exchangeBoxWrapper}>
            <div className={styles.exchangeBox}>
              <div className='blue_gradient' />
              <div className={styles.exchange}>
                {account ? (
                  <>
                    <Exchange />
                    <ToastContainer hideProgressBar={true} />
                  </>
                ) : (
                  <Loader title='Please connect your wallet' />
                )}
              </div>
              <div className='blue_gradient' />
            </div>
          </div>
          <div className={styles.exchangeBoxWrapper}>
            <div className={styles.nftGrid}>
              <div>
                <img
                  src={one}
                  alt='cashout puppies'
                  className={styles.NftImg}
                />
              </div>
              <div>
                <img
                  src={two}
                  alt='cashout puppies'
                  className={styles.NftImg}
                />
              </div>
              <div>
                <img
                  src={three}
                  alt='cashout puppies'
                  className={styles.NftImg}
                />
              </div>
              <div>
                <img
                  src={four}
                  alt='cashout puppies'
                  className={styles.NftImg}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
