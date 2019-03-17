import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

const HomesteadPath = ({
  formSubmit,
  msg,
  pathClick,
}) => (
  <div className="modal is-active has-text-centered">
    <div
      className="modal-background"
      css={css`
        background: #000;
      `}
    />
    <div className="modal-content">

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
          <p>{msg}</p>
          <div className="control">
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
    </div>
  </div>
)

export default HomesteadPath
