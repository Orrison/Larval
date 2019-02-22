import React from 'react'
import PropTypes from 'prop-types'
import '../../node_modules/bulma/css/bulma.css'
import styles from './Vagrant.module.css'
// import { vagrantSSH } from '../Util/VagrantHelpers'
import ConsoleInput from './ConsoleInput/ConsoleInput'

const uuid = require('random-uuid-v4')

const Vagrant = (props) => {
  const {
    vConsole,
    clickToggle,
    clickClear,
    clickProv,
    status,
    SshToggle,
    vagrantId,
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

  const consoleContent = vConsole.map(item => <p key={uuid()}>{`${item}\n`}</p>)

  return (
    <div className={`${styles.Vagrant}`}>
      <button className={`button is-pulled-left is-large ${classes}`} onClick={clickToggle} type="button">{text}</button>
      <button className="button is-pulled-left is-large is-text" onClick={clickClear} type="button">Clear</button>
      <button className="button is-pulled-left is-large is-text" onClick={clickProv} type="button">Provison</button>
      <button className="button is-pulled-left is-large is-text" onClick={() => SshToggle(vagrantId)} type="button">SSH</button>
      <div id="vagrantConsole" className={`${styles.console}`}>
        {consoleContent}
      </div>
      <ConsoleInput 
        style={{
          width: "100%",
          padding: "0 10px 0 10px",
          margin: "0",
          height: "8vh",
          fontSize: "16px",
          backgroundColor: "#000",
          color: "green",
          border: "none",
        }}
        vagrantCommand={props.vagrantCommand}
      />
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
