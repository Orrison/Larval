import React from 'react'
import '../../node_modules/bulma/css/bulma.css'

import styles from './HomesteadSettings.module.css'

const HomesteadSettings = ({
  formSubmit,
  ip,
  memory,
  cpus,
  close,
  provider,
}) => (
  <div className="modal is-active has-text-centered">
    <div className="modal-background" />
    <div className="modal-content">

      <form onSubmit={formSubmit}>

        <div className="field is-grouped">
          <div className="field-label is-medium">
            <label className="label customLabel">IP</label>
          </div>
          <div className="control">
            <input
              name="ip"
              className="input"
              type="text"
              placeholder="192.168.10.10"
              defaultValue={ip}
            />
          </div>
          <div className="field-label is-medium">
            <label className="label customLabel">Memory</label>
          </div>
          <div className="control">
            <input
              name="memory"
              className="input"
              type="text"
              placeholder="2048"
              defaultValue={memory}
            />
          </div>
        </div>
        <div className="field is-grouped">
          <div className="field-label is-medium">
            <label className="label customLabel">CPUs</label>
          </div>
          <div className="control">
            <input
              name="cpus"
              className="input"
              type="text"
              placeholder="1"
              defaultValue={cpus}
            />
          </div>
          <div className="field-label is-medium">
            <label className="label customLabel">Provider</label>
          </div>
          <div className="select">
            <select name="provider" defaultValue={provider}>
              <option value="virtualbox">virtualbox</option>
              <option value="vmware_fusion">vmware_fusion</option>
              <option value="vmware_workstation">vmware_workstation</option>
              <option value="parallel">parallel</option>
              <option value="hyper">hyper</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label className={`checkbox ${styles.checkboxLabel}`}>
            <input type="checkbox" className={`tooltip ${styles.checkboxes}`} name="backupYaml" data-tooltip="Saves backup to your documents folder" />
                Backup my Homestead.yaml
          </label>
        </div>

        <button id="homestead-settings-submit" className={`button is-link is-large ${styles.customSubmit}`} type="button">
            Save
        </button>

      </form>
    </div>
    <button className="modal-close is-large" onClick={close} aria-label="close" type="button" />
  </div>
)

export default HomesteadSettings
