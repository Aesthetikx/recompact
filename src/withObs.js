import callOrUse from './utils/callOrUse';
import createHOCFromMapper from './utils/createHOCFromMapper';
import createHelper from './createHelper';

/**
 * Similar to `mapObs` except that observables will be merged to the previous ones.
 *
 * @static
 * @category High-order-components
 * @param {Function} obsMapper The function that take previous observables and returns new ones.
 * @returns {HighOrderComponent} Returns a function that take a Component.
 * @example
 *
 * const withFullName$ = mapObs(({firstName$, props$}) => ({
 *  fullName$: Observable.combineLatest(
 *    firstName$,
 *    props$.pluck('lastName'),
 *    (firstName, lastName) => `${firstName} ${lastName}`
 *   )
 * }))
 */
const withObs = obsMapper => createHOCFromMapper((props$, obs) => {
  const {props$: nextProps$ = props$, ...nextObs} = callOrUse(obsMapper)({...obs, props$});
  return [nextProps$, {...obs, ...nextObs}];
});

export default createHelper(withObs, 'withObs');
