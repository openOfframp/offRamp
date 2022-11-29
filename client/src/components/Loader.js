import React from "react"

import styles from "../styles"
import { polygonMaticLogo } from "../assets"

const Loader = ({ title }) => {
  return (
    <div className={styles.loader}>
      <img
        src={polygonMaticLogo}
        alt='ploygon logo'
        className={styles.loaderImg}
      />

      <p className={styles.loaderText}>{title}</p>
    </div>
  )
}

export default Loader
