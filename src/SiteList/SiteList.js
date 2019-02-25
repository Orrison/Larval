import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
import style from './SiteList.module.css'
import SiteListItem from './SiteListItem/index'

const SiteList = ({ list, listItemClick, click }) => (
  <div className={`column is-one-third ${style.wrapper}`}>
    <div className={`${style.list}`}>
      {list.map((item, index) => (
        <SiteListItem
          key={index} // eslint-disable-line
          site={item.map}
          index={index}
          click={listItemClick}
        />
      ))}
    </div>
    <div className={style.createNew} onClick={click} onKeyDown={click} role="menuitem" tabIndex="0">
      <p>Create New</p>
    </div>
  </div>
)

export default SiteList
