import {mapTo} from 'rxjs/operator/mapTo';
import {_do} from 'rxjs/operator/do';
import createHelper from './createHelper';
import withObs from './withObs';

const mapValues = (obj, fn) => {
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = fn(value);
  });
  return result;
};

const withHandlers = handlerFactories => withObs(({props$}) => {
  let cachedHandlers;
  let props;

  const onNextProps = (nextProps) => {
    cachedHandlers = {};
    props = nextProps;
  };

  const handlers = mapValues(handlerFactories,
    (createHandler, handlerName) => (...args) => {
      const cachedHandler = cachedHandlers[handlerName];
      if (cachedHandler) {
        return cachedHandler(...args);
      }

      const handler = createHandler(props);
      cachedHandlers[handlerName] = handler;

      if (
        process.env.NODE_ENV !== 'production' &&
        typeof handler !== 'function'
      ) {
        throw new Error(
          'withHandlers(): Expected a map of higher-order functions. ' +
          'Refer to the docs for more info.',
        );
      }

      return handler(...args);
    },
  );

  return {props$: props$::_do(onNextProps)::mapTo(handlers)};
});

export default createHelper(withHandlers, 'withHandlers');
