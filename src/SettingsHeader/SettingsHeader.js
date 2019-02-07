import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
import styles from './SettingsHeader.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'

const SettingsHeader = ( props ) => {

  return (
    <div className={`${styles.SettingsHeader}`}>
      <h1>{props.title}</h1>
      <FontAwesomeIcon icon={faCog} size="2x" className={`is-pulled-right ${styles.cog}`} />
    </div>
  );
}

export default SettingsHeader;
