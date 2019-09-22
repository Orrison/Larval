import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

const SettingsHeader = ( props ) => {

  return (
    <div css={css`
      height: 15vh;
      background: #202020;
      display: flex;
      text-align: center;
    `}>
      <h1>Vagrant Controls</h1>
      <FontAwesomeIcon icon={faCog} size="2x" className={`is-pulled-right`} onClick={props.settingsClick} css={css`
        align-self: center;
        right: 5%;
        position: relative;
        cursor: pointer;
      `}/>
    </div>
  );
}

export default SettingsHeader;
