import React from 'react';
import { shallow } from 'enzyme';
import SiteList from './SiteList';

describe('<SiteList />', () => {
  test('renders', () => {
    const wrapper = shallow(<SiteList />);
    expect(wrapper).toMatchSnapshot();
  });
});
