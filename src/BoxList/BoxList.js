import React, { Component } from 'react'
import BoxListItem from './BoxListItem'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

const uuidv4 = require('uuid/v4')

class BoxList extends Component {
  constructor(props){
    super(props)
    this.state = {}
  }

  componentDidMount(){
  }
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

          h3 {
            padding-top: 20px;
          }
        `}
      >
        <h3>Homestead Boxes:</h3>
        {this.props.boxes.map((item, index) => {
          return (
            <BoxListItem
              key={uuidv4(item.path)}
              name={item.name}
            />
            )
          })}
      </div>
    )
  }
}

export default BoxList