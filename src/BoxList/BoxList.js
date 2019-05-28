import React, { Component } from 'react'
import BoxListItem from './BoxListItem'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

class BoxList extends Component {
  // constructor(props){
    // super(props)
    // this.state = {}
  // }

  // componentDidMount(){}
  // componentWillUnmount(){}

  // componentWillUpdate(){}

  render() {
    return (
      <div
        css={css`
          background-color: #202020;
          height: 50vh;
          position: relative;
          padding: 0;
          font-size: 20px;
        `}
      >
        <BoxListItem/>
      </div>
    )
  }
}

export default BoxList