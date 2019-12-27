import React from 'react'
import '../../../node_modules/bulma/css/bulma.css'
/** @jsx jsx */
import { css, jsx, keyframes } from '@emotion/core'


const BoxListItem = (props) => {

    const changeColor = keyframes`
        0% {
            background-color: yellow;
        }
        
        50% {
            background-color: red;
        }
        
        100% {
            background-color: green;
        }
    `

    const indicator = css`
        width: 11px;
        height: 11px;
        background-color: white;
        position: absolute;
        border-radius: 50%;
        top: 20px;
        left: 20px;
        animation-name: ${changeColor};
        animation-iteration-count: infinite;
        animation-duration: 1s;
        animation-direction: alternate;
    `

    let statusCss = null

    if (props.status == 'online') {
        statusCss = css`
            background-color: green; 
            animation-name: none;
        `
    } else if (props.status == 'offline') {
        statusCss = css`
            background-color: red; 
            animation-name: none;
        `
    }

  const base = css`
    padding: 10px 0;
    position: relative;
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
  `

  const selected = (props.isCurrent) ? css`
    background: #f5b976;
    background: -moz-linear-gradient(-45deg, #f5b976 21%, #af2518 82%);
    background: -webkit-linear-gradient(-45deg, #f5b976 21%,#af2518 82%);
    background: linear-gradient(135deg, #f5b976 21%,#af2518 82%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f5b976', endColorstr='#af2518',GradientType=1 );
  ` : null

  return (
    <div 
      onClick={()=>props.click(props.index)}
      css={[base, selected]}
    >
        <div css={[indicator, statusCss]}></div>
        <p>{props.name}</p>
    </div>
  )
}

export default BoxListItem