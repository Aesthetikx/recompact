import React from 'react';
import {mount, shallow} from 'enzyme';
import {withState} from 'recompose';
import {compose, pure, withProps} from '../';
import {countRenders, Dummy} from './utils';

describe('pure', () => {
  it('should not render component if props are the same (shallow)', () => {
    const initialTodos = ['eat', 'drink', 'sleep'];
    const Todos = compose(
      withState('todos', 'updateTodos', initialTodos),
      pure,
      countRenders,
    )(Dummy);

    const dummy = mount(<Todos />).find(Dummy);
    const updateTodos = dummy.prop('updateTodos');

    expect(dummy.prop('todos')).toBe(initialTodos);
    expect(dummy.prop('renderCount')).toBe(1);

    // Does not re-render
    updateTodos(initialTodos);
    expect(dummy.prop('todos')).toBe(initialTodos);
    expect(dummy.prop('renderCount')).toBe(1);

    updateTodos(todos => todos.slice(0, -1));
    expect(dummy.prop('todos')).toEqual(['eat', 'drink']);
    expect(dummy.prop('renderCount')).toBe(2);
  });

  it('should be merged with other hoc', () => {
    const Component = compose(
      withProps({}),
      pure,
    )('div');

    const wrapper = shallow(<Component />);
    expect(wrapper.instance().constructor.displayName).toBe('withProps(pure(div))');
    expect(wrapper.equals(<div />)).toBeTruthy();
  });
});
