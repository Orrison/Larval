import React from 'react'
import '../../../node_modules/bulma/css/bulma.css'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'


const BoxListItem = (props) => {
  return (
    <div 
      css={css`
        padding: 10px 0;
        &:hover {
          color: #fff;
          cursor: pointer;
          background: #f5b976;
          background: -moz-linear-gradient(-45deg, #f5b976 21%, #af2518 82%);
          background: -webkit-linear-gradient(-45deg, #f5b976 21%,#af2518 82%);
          background: linear-gradient(135deg, #f5b976 21%,#af2518 82%);
          filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f5b976', endColorstr='#af2518',GradientType=1 );
        }
        &:first-of-type {
          margin-top: 10px;
        }
      `}
    >
      <p>Test</p>
    </div>
  )
}

export default BoxListItem