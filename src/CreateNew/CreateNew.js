/* eslint-disable jsx-a11y/label-has-associated-control */
// eslint-disable-next-line no-unused-vars
import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
import '../../node_modules/bulma-tooltip/dist/css/bulma-tooltip.min.css'
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
  let deleteButtonLoad = null
  if (deleteButton) {
    deleteButtonLoad = (
      <button
        type="button"
        className="button is-danger is-large"
        onClick={e => formSubmit(e, true)}
        css={css`
          margin: 0 auto;
          display: block;
        `}
      >
        Delete
      </button>
    )
  }

  return (
    <div className="modal is-active has-text-centered">
      <div className="modal-background" />
      <div className="modal-content">
        <form onSubmit={formSubmit}>

          <h1 css={css`
          text-align: left;
        `}
          >
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

          <h1 css={css`
          text-align: left;
        `}
          >
Sites

          </h1>
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
                type="button"
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
          <div className="field">
            <div className="control">
              {deleteButtonLoad}
            </div>
          </div>
        </form>
      </div>
      <button type="button" className="modal-close is-large" onClick={() => close(1)} aria-label="close" />
    </div>
  )
}

export default CreateNew
