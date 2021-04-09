# denocl

WIP collection of WebGPU driven matrix operations.

```ts
import { Matrix } from "./src/matrix/matrix.ts";
import { sgemm } from "./src/matrix/sgemm/mod.ts";

const matrixA = new Matrix(
  [2, 2],
  new Float32Array([1, 1, 0, 1]),
);

const matrixB = new Matrix(
  [2, 2],
  new Float32Array([0, 1, 1, 0]),
);

/**
 * C = alpha * A * B + beta * C
 */
const result = await sgemm({ matrixA, matrixB });

console.log(result); // Float32Array(6) [2, 2, 1, 1, 1, 0]
```
