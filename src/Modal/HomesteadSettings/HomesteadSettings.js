import React from 'react'
import '../../../node_modules/bulma/css/bulma.css'
import '../../../node_modules/bulma-tooltip/dist/css/bulma-tooltip.min.css'
import Modal from '../Modal'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

const HomesteadSettings = ({
  formSubmit,
  ip,
  memory,
  cpus,
  close,
  provider,
}) => (
  <Modal>
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
          <label className="checkbox">
            <input type="checkbox" className="tooltip" name="backupYaml" data-tooltip="Saves backup to your documents folder" />
                Backup my Homestead.yaml
          </label>
        </div>

        <button
          id="homestead-settings-submit"
          className="button is-link is-large"
          type="submit"
          css={css`
            margin: 0 auto;
            display: block;
          `}
        >
            Save
        </button>
      </form>
    <button className="modal-close is-large" onClick={close} aria-label="close" type="button" />
  </Modal>
)

export default HomesteadSettings
