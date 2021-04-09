/**
 * error
 * 
 * Throws an error constructed from the provided base object.
 * 
 * @param {Error | Record<string, string>} base The object to construct the thrown error from.
 * @private
 */
export function error(base: Error | Record<string, string>): never {
  if (!(base instanceof Error)) {
    base = Object.assign(new Error(base.message), base);
  }

  throw base;
}
