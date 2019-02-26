import React from 'react';
import { shallow } from 'enzyme';
import CreateNew from './CreateNew';

describe('<CreateNew />', () => {
  test('renders', () => {
    const wrapper = shallow(<CreateNew />);
    expect(wrapper).toMatchSnapshot();
  });
});
