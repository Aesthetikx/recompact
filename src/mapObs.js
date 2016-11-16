/* eslint-disable no-console */
import {Component, PropTypes} from 'react';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import createEagerFactory from 'recompose/createEagerFactory';
import createHelper from './createHelper';
import createSymbol from './utils/createSymbol';

const throwError = (error) => {
  throw error;
};

const MAPPERS_INFO = createSymbol('mappersInfo');
const OBSERVABLES = createSymbol('observables');

const createComponentFromMappers = (mappers, BaseComponent) => {
  const factory = createEagerFactory(BaseComponent);

  return class extends Component {
    static [MAPPERS_INFO] = {mappers, BaseComponent};
    static contextTypes = {[OBSERVABLES]: PropTypes.object};
    static childContextTypes = {[OBSERVABLES]: PropTypes.object};

    props$ = new BehaviorSubject(this.props);

    getChildContext() {
      return this.childContext;
    }

    componentWillMount() {
      const {
        props$: nextProps$,
        ...childObservables
      } = mappers.reduce(
        (result, provider) => ({
          props$: this.props$,
          ...provider(result),
        }),
        {
          ...this.context[OBSERVABLES],
          props$: this.props$,
        },
      );

      this.subscription = nextProps$.subscribe({
        next: props => this.setState({props}),
        error: throwError,
      });

      this.childContext = {[OBSERVABLES]: childObservables};
    }

    componentWillReceiveProps(nextProps) {
      this.props$.next(nextProps);
    }

    componentWillUnmount() {
      this.subscription.unsubscribe();
    }

    shouldComponentUpdate(nextProps, nextState) {
      return this.state.props !== nextState.props;
    }

    render() {
      if (!this.state.props) {
        return null;
      }

      return factory(this.state.props);
    }
  };
};

export default createHelper(mapper => (BaseComponent) => {
  if (BaseComponent[MAPPERS_INFO]) {
    return createComponentFromMappers(
      [mapper, ...BaseComponent[MAPPERS_INFO].mappers],
      BaseComponent[MAPPERS_INFO].BaseComponent,
    );
  }

  return createComponentFromMappers([mapper], BaseComponent);
}, 'mapObs');
