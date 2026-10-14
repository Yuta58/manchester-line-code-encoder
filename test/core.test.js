import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encode } from '../src/index.js';

test('empty input yields empty output', () => {
  assert.deepEqual(encode([]), []);
});

test('single 0 encodes to low-then-high (IEEE 802.3)', () => {
  assert.deepEqual(encode([0]), [0, 1]);
});

test('single 1 encodes to high-then-low (IEEE 802.3)', () => {
  assert.deepEqual(encode([1]), [1, 0]);
});

test('alternating 0 1 0 1 produces correct transitions', () => {
  assert.deepEqual(encode([0, 1, 0, 1]), [0, 1, 1, 0, 0, 1, 1, 0]);
});

test('long run of zeros is handled deterministically', () => {
  const input = Array(64).fill(0);
  const expected = Array(64).fill(0).flatMap(() => [0, 1]);
  assert.deepEqual(encode(input), expected);
});

test('long run of ones is handled deterministically', () => {
  const input = Array(64).fill(1);
  const expected = Array(64).fill(0).flatMap(() => [1, 0]);
  assert.deepEqual(encode(input), expected);
});

test('accepts any iterable, not just arrays', () => {
  function* gen() { yield 1; yield 0; yield 1; }
  assert.deepEqual(encode(gen()), [1, 0, 0, 1, 1, 0]);
});

test('rejects null input', () => {
  assert.throws(() => encode(null), TypeError);
});

test('rejects undefined input', () => {
  assert.throws(() => encode(undefined), TypeError);
});

test('rejects non-iterable input', () => {
  assert.throws(() => encode(42), TypeError);
});

test('rejects boolean true as a bit value', () => {
  assert.throws(() => encode([true]), RangeError);
});

test('rejects string "1" as a bit value', () => {
  assert.throws(() => encode(['1']), RangeError);
});

test('rejects fractional numbers', () => {
  assert.throws(() => encode([1.5]), RangeError);
});

test('error message includes the offending index', () => {
  assert.throws(
    () => encode([0, 1, 2]),
    (err) => err instanceof RangeError && /index 2/.test(err.message)
  );
});
