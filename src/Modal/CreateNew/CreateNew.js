/* eslint-disable jsx-a11y/label-has-associated-control */
// eslint-disable-next-line no-unused-vars
import React from 'react'
import '../../../node_modules/bulma/css/bulma.css'
import '../../../node_modules/bulma-tooltip/dist/css/bulma-tooltip.min.css'
import Modal from '../Modal'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

const CreateNew = ({
  deleteButton,
  formSubmit,
  folderMap,
  pathClick,
  folderTo,
  siteMap,
  siteTo,
  button,
  close,
}) => {
  return (
    <Modal>
        <form onSubmit={formSubmit}>
          <h1 css={css`
            text-align: left;
          `}>
            Folder
          </h1>
          <div className="field">
            <label className="label customLabel">Map</label>
            <div className="control">
              <input name="folderMap" className="input is-medium" type="text" placeholder="/user/joeshmoe/websites/" defaultValue={folderMap} onClick={pathClick} />
            </div>
          </div>

          <div className="field">
            <label className="label customLabel">To</label>
            <div className="control">
              <input name="folderTo" className="input is-medium" type="text" placeholder="/user/joeshmoe/websites/" defaultValue={folderTo || '/home/vagrant/sites/MAP_FOLDER_NAME_HERE'} onClick={pathClick} />
            </div>
          </div>

          <h1 css={css`text-align: left;`}>Sites</h1>
          <div className="field">
            <label className="label customLabel">Map</label>
            <div className="control">
              <input name="siteMap" className="input is-medium" type="text" placeholder="newsite.test" defaultValue={siteMap} />
            </div>
          </div>

          <div className="field">
            <label className="label customLabel">To</label>
            <div className="control">
              <input name="siteTo" className="input is-medium" type="text" placeholder="Generally the same as Folder To (Laravel sites append '/public')" defaultValue={siteTo} />
            </div>
          </div>

          <div className="field">
            <label
              className="checkbox"
            >
              <input type="checkbox" className="tooltip" name="backupHost" data-tooltip="Saves backup to your documents folder" />
              Backup my hosts file
            </label>
          </div>
          <div className="field">
            <label className="checkbox">
              <input type="checkbox" className="tooltip" name="backupYaml" data-tooltip="Saves backup to your documents folder" />
              Backup my Homestead.yaml
            </label>
          </div>

          <div className="field">
            <div className="control">
              <button
                type="submit"
                id="create-new-submit"
                className="button is-link is-large"
                css={css`
                  margin: 0 auto;
                  display: block;
                `}
              >
                {button}
              </button>
            </div>
          </div>
        </form>
      <button type="button" className="modal-close is-large" onClick={() => close(1)} aria-label="close" />
    </Modal>
  )
}

export default CreateNew
