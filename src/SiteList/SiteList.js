import React from 'react';
import '../../node_modules/bulma/css/bulma.css'
import style from './SiteList.module.css'
import SiteListItem from './SiteListItem/index.js'

const SiteList = ( props ) => {

  return (
    <div className={`column is-one-third ${style.wrapper}`}>
      <div className={`${style.list}`}>
      {props.list.map((item, index) => {
        return <SiteListItem 
          key={index}
          site={item.map}
          index={index}
          click={props.listItemClick}
        />
      })}
      </div>
      <div className={style.createNew} onClick={props.click}>
        <p>Create New</p>
      </div>
    </div>
  );
}

export default SiteList;
