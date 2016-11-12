import React from 'react';
import Rx from 'rxjs';
import {mount, shallow} from 'enzyme';
import {compose, mapObs} from '../';

describe('mapObs', () => {
  it('should emit props$.next when component receive props', () => {
    const propsSpy = jest.fn();
    const Component = mapObs(({props$}) => ({props$: props$.do(propsSpy)}))('div');

    const wrapper = shallow(<Component className="bar" />);

    expect(propsSpy).toHaveBeenCalledTimes(1);
    expect(propsSpy).toHaveBeenLastCalledWith({className: 'bar'});

    wrapper.setProps({className: 'foo'});

    expect(propsSpy).toHaveBeenCalledTimes(2);
    expect(propsSpy).toHaveBeenLastCalledWith({className: 'foo'});
  });

  it('should take new props from props$', () => {
    const Component = mapObs(
      ({props$}) => ({props$: props$.map(({strings}) => ({className: strings.join('')}))}),
    )('div');

    shallow(<Component strings={['a', 'b', 'c']} />);
  });

  it('should unsubscribe props$ when unmount', () => {
    const props$ = new Rx.BehaviorSubject({});
    const propsSpy = jest.fn();
    const Component = mapObs(() => ({props$: props$.do(propsSpy)}))('div');
    const wrapper = shallow(<Component />);
    expect(propsSpy).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    props$.next({foo: 'bar'});
    expect(propsSpy).toHaveBeenCalledTimes(1);
  });

  it('props$ should throw errors', () => {
    const props$ = new Rx.BehaviorSubject({});

    const Component = mapObs(() => ({props$: props$.map(() => {
      throw new Error('Too bad');
    })}))('div');

    expect(() => {
      shallow(<Component />);
    }).toThrow();
  });

  it('should provide observables', () => {
    const baseFoo$ = Rx.Observable.of({className: 'foo'});
    const Component = compose(
      mapObs(() => ({foo$: baseFoo$})),
      mapObs(({foo$}) => ({props$: foo$})),
    )('div');

    const wrapper = mount(<Component />);
    expect(wrapper.find('div').prop('className')).toBe('foo');
  });

  it('should not merge observables', () => {
    const baseFoo$ = Rx.Observable.of({className: 'foo'});
    const Component = compose(
      mapObs(() => ({foo$: baseFoo$})),
      mapObs(() => ({})),
      mapObs(({foo$}) => {
        expect(foo$).toBe(undefined);
        return {};
      }),
    )('div');

    mount(<Component />);
  });

  it('should be merged with other hoc', () => {
    const Component = compose(
      mapObs(() => ({})),
      mapObs(() => ({})),
      mapObs(() => ({})),
    )('div');

    const wrapper = shallow(<Component />);
    expect(wrapper.instance().constructor.displayName).toBe('mapObs(mapObs(mapObs(div)))');
    expect(wrapper.equals(<div />)).toBeTruthy();
  });
});
