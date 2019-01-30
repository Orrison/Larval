import React, { Component } from 'react';
import '../../node_modules/bulma/css/bulma.css'
import style from './SiteList.module.css'

const SiteList = ( props ) => {

  return (
    <div className={`column is-one-third ${style.wrapper}`}>
      <p>{props.text}</p>
    </div>
  );
}

export default SiteList;
