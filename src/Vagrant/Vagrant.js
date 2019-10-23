import React from 'react'
import PropTypes from 'prop-types'
import '../../node_modules/bulma/css/bulma.css'
import { vagrantSSH } from '../Util/VagrantHelpers'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import parse from 'html-react-parser'

const uuid = require('random-uuid-v4')

const Vagrant = (props) => {
  const {
    vConsole,
    clickToggle,
    clickClear,
    clickProv,
    status,
    vagrantId,
    shouldProvision,
  } = props
  let classes
  let text
  switch (status) {
    case 'offline':
      classes = 'is-success'
      text = 'Start'
      break
    case 'processing':
      classes = 'is-info is-loading'
      text = ''
      break

    case 'online':
      classes = 'is-danger'
      text = 'Stop'
      break
    default:
            // code block
  }

  let provButtClass = 'is-text'
  if (shouldProvision) {
    provButtClass = 'is-primary'
  }

  const consoleContent = vConsole.map(item => <p key={uuid()}>{parse(item)}</p>)

  let sshButton = null
  if (vagrantId != null) {
    sshButton = (
      <button className="button is-pulled-right is-large is-text" onClick={() => vagrantSSH(vagrantId)} type="button">SSH</button>
    )
  }

  return (
    <div css={css`
      height: 85vh;
      background: #000;
      
      button {
        width: 120px;
      }
    `}>
      <button className={`button is-pulled-left is-large ${classes}`} onClick={clickToggle} type="button">{text}</button>
      <button className="button is-pulled-left is-large is-text" onClick={clickClear} type="button">Clear</button>
      <button className={`button is-pulled-right is-large ${provButtClass}`} onClick={clickProv} type="button">Provision</button>
      {sshButton}
      <div id="vagrantConsole" css={css`
        background: #000;
        overflow-y: scroll;
        clear: both;
        height: 75vh;

        p {
          color: #fff;
        }
      `}>
          {consoleContent}
      </div>
    </div>
  )
}

Vagrant.propTypes = {
  console: PropTypes.instanceOf(Array),
  status: PropTypes.string,
  clickToggle: PropTypes.func,
  clickClear: PropTypes.func,
  clickProv: PropTypes.func,
}

export default Vagrant
