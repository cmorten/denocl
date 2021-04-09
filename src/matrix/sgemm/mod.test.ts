import { Matrix } from "../matrix.ts";
import { sgemm } from "./mod.ts";
import { expect } from "../../../test/deps.ts";
import { describe, it } from "../../../test/utils.ts";
import { destroy } from "../../device/request.ts";

const squareMatrixA = new Matrix(
  [2, 2],
  [1, 1, 0, 1],
);

const squareMatrixB = new Matrix(
  [2, 2],
  [0, 1, 1, 0],
);

describe("sgemm", () => {
  it("should handle square matrix multiplication", async () => {
    expect(await sgemm({ matrixA: squareMatrixA, matrixB: squareMatrixB }))
      .toEqual(new Matrix([2, 2], [1, 1, 1, 0]));

    destroy();
  });
});
