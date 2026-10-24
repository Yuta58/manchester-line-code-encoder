# manchester-line-code-encoder

Encodes a bitstream with Manchester phase encoding (IEEE 802.3 convention) so each bit period contains a mid-bit transition, yielding a self-clocking line signal.

```js
import { encode } from 'manchester-line-code-encoder';

const line = encode([0, 1, 0, 1]);
// => [0, 1, 1, 0, 0, 1, 1, 0]
```

`encode` takes any iterable of `0` / `1` integers and returns a flat array of `0` / `1` line symbols — two output symbols per input bit. A `0` becomes `0,1` (low-to-high) and a `1` becomes `1,0` (high-to-low), matching the Ethernet PHY convention.

## Why this exists

Physical-layer signalling over a DC-coupled channel often needs the receiver to recover a clock from the data itself. NRZ fails this when a long run of identical bits produces no edges. Manchester solves it by guaranteeing one transition per bit, at the cost of doubling the symbol rate relative to the bit rate. This library performs only the encoding step — it does not frame, scramble, or drive a DAC — so it composes cleanly with whatever framing and transport you already have.

## Edge case to know about

`encode` is strict about element types: only the integers `0` and `1` are accepted. Booleans, the strings `"0"` / `"1"`, and fractional numbers all throw `RangeError`. If your upstream parse produces loose values, normalise them to integers before calling `encode`.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

