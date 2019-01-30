import React, { Component } from 'react';
import '../../node_modules/bulma/css/bulma.css'
import style from './SiteList.module.css'

class SiteList extends Component {
  render() {
    return (
      <div className={`column is-one-third ${style.wrapper}`}>SiteList</div>
    );
  }
}

export default SiteList;
