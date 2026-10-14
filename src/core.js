/**
 * Manchester line code encoder.
 *
 * Convention chosen: IEEE 802.3 ("G.E. Thomas" is the other common one).
 *   0 bit -> low-to-high transition  (0 then 1)
 *   1 bit -> high-to-low transition  (1 then 0)
 *
 * Why IEEE 802.3: it is the convention used by Ethernet PHYs and is the more
 * common expectation when engineers say "Manchester encoding" without further
 * qualification. The G.E. Thomas convention simply inverts every output bit,
 * so callers who need that can map the result themselves.
 *
 * Return type is an array of 0/1 integers rather than a string. Strings would
 * tempt callers to do substring slicing, which hides per-element cost; an array
 * makes the element count explicit and keeps the API trivially composable with
 * downstream symbol mappers.
 */

/**
 * Encode a bitstream using Manchester phase encoding (IEEE 802.3 convention).
 *
 * @param {Iterable<number>} bits - Values interpreted as bits: 0 -> 0, 1 -> 1,
 *   anything else throws. Each input bit produces two output symbols.
 * @returns {number[]} Flat array of 0/1 line symbols.
 * @throws {TypeError} If `bits` is null/undefined or not iterable.
 * @throws {RangeError} If any element is not exactly 0 or 1.
 */
export function encode(bits) {
  if (bits === null || bits === undefined) {
    throw new TypeError('encode(): input must be an iterable of bits, received ' + bits);
  }
  if (typeof bits[Symbol.iterator] !== 'function') {
    throw new TypeError('encode(): input must be iterable; missing Symbol.iterator');
  }

  const out = [];
  let idx = 0;
  for (const b of bits) {
    // Strict bit check: booleans, floats like 1.5, and the strings "0"/"1" are
    // all rejected. Accepting truthy/falsy values would silently corrupt the
    // stream for callers who pass a parsed JSON number or a loose parse.
    if (b !== 0 && b !== 1) {
      throw new RangeError(
        'encode(): each element must be 0 or 1, got ' +
          JSON.stringify(b) +
          ' at index ' +
          idx
      );
    }
    // IEEE 802.3: 0 -> 01, 1 -> 10.
    out.push(b === 0 ? 0 : 1, b === 0 ? 1 : 0);
    idx += 1;
  }
  return out;
}
