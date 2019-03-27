import React from 'react'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
const { shell } = require('electron')


const SiteOptions = (props) => {
  return (
    <div css={css`
      display: ${props.status};
      div {
        flex-grow: 1;
        cursor: pointer;
      }
    `}>
      <div 
        onClick={()=>shell.openExternal('http://' + props.site)}
        css={css`
          background: green;
        `}
      >
        <span>View</span>
      </div>
      <div onClick={()=>props.edit(props.index)}
        css={css`
          background: orange;
        `}
      >
        <span>Edit</span>
      </div>
      <div css={css`
        background: red;
      `}>
        Delete
      </div>
    </div>
  )
}

export default SiteOptions