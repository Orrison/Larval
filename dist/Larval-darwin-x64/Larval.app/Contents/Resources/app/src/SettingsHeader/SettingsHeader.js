import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import styles from './SettingsHeader.module.css'

const SettingsHeader = ( props ) => {

  return (
    <div className={`${styles.SettingsHeader}`}>
      <h1>Vagrant Controls</h1>
      <FontAwesomeIcon icon={faCog} size="2x" className={`is-pulled-right ${styles.cog}`} onClick={props.settingsClick} />
    </div>
  );
}

export default SettingsHeader;
