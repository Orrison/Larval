import React from 'react'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'


const Modal = ({ children }) => {
  return (
    <div className="modal is-active has-text-centered">
      <div
        className="modal-background"
        css={css`
          background: #000;
        `}
      />
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
}

export default Modal;