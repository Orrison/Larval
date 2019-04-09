import React from 'react'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
const { shell } = require('electron')
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'


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
        <FontAwesomeIcon icon={faEye} />
      </div>
      <div onClick={()=>props.edit(props.index, true)}
        css={css`
          background: orange;
        `}
      >
        <FontAwesomeIcon icon={faPencilAlt} />
      </div>
      <div
        css={css`
          background: red;
        `}
        onClick={
          () => Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
            if (result.value) {
              props.edit(props.index, false)
              props.delete()
            }
          })
        }
      >
        <FontAwesomeIcon icon={faTrashAlt} />
      </div>
    </div>
  )
}

export default SiteOptions