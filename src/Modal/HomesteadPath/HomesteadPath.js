import React from 'react'
import '../../../node_modules/bulma/css/bulma.css'
import Modal from '../Modal'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

const HomesteadPath = ({
  formSubmit,
  pathClick,
}) => (
  <Modal>
      <form onSubmit={formSubmit}>
        <div className="field">
          <label
            className="label"
            css={css`
              color: #fff;
              font-size: 26px;
            `}
          >
            Set the path to your Homestead folder
          </label>
          <p>The Homestead path provided is either not the Homestead folder or your Homestead.yaml is missing :(</p>
          <div className="control">
            <input name="name" className="input is-medium" type="text" placeholder="My Vagrant Box" required />
            <input name="path" className="input is-medium" type="text" placeholder="/user/joeshmoe/websites/" onFocus={pathClick} required />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button
              id="create-new-submit"
              className="button is-link is-large"
              type="submit"
              css={css`
                margin: 0 auto;
                display: block;
                margin-top: 6%;
              `}
            >
              Set Path
            </button>
          </div>
        </div>
      </form>
  </Modal>
)

export default HomesteadPath
