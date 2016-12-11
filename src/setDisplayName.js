import setStatic from './setStatic';

/**
 * Assigns to the `displayName` property on the base component.
 *
 * @static
 * @category High-order-components
 * @param {String} displayName
 * @returns {HighOrderComponent} Returns a function that take a Component.
 * @example
 *
 * setDisplayName('AnotherDisplayName')(MyComponent);
 */
const setDisplayName = displayName => setStatic('displayName', displayName);

export default setDisplayName;
