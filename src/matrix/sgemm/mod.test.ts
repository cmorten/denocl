import { Matrix } from "../matrix.ts";
import { sgemm } from "./mod.ts";
import { expect } from "../../../test/deps.ts";
import { describe, it } from "../../../test/utils.ts";

const squareMatrixOne = new Matrix(
  [2, 2],
  [1, 1, 0, 1],
);

const squareMatrixTwo = new Matrix(
  [2, 2],
  [0, 1, 1, 0],
);

const nonSquareMatrixOne = new Matrix(
  [4, 1],
  [1, 1, 0, 1],
);

const nonSquareMatrixTwo = new Matrix(
  [1, 2],
  [0, 1],
);

describe("sgemm", () => {
  it("should handle square matrix multiplication", async () => {
    expect(await sgemm({ matrixA: squareMatrixOne, matrixB: squareMatrixTwo }))
      .toEqual(
        new Matrix(
          [2, 2],
          [1, 1, 1, 0],
        ),
      );
  });

  it("should handle non-square matrix multiplication", async () => {
    expect(
      await sgemm({ matrixA: nonSquareMatrixOne, matrixB: nonSquareMatrixTwo }),
    )
      .toEqual(
        new Matrix(
          [4, 2],
          [0, 1, 0, 1, 0, 0, 0, 1],
        ),
      );
  });

  it("should apply an alpha scalar to matrix multiplication", async () => {
    expect(
      await sgemm({
        matrixA: squareMatrixOne,
        matrixB: squareMatrixTwo,
        alpha: 0.5,
      }),
    )
      .toEqual(
        new Matrix(
          [2, 2],
          [0.5, 0.5, 0.5, 0],
        ),
      );
  });

  it("should handle square matrix multiplication with matrix A transposed", async () => {
    expect(
      await sgemm({
        matrixA: squareMatrixOne,
        matrixB: squareMatrixTwo,
        transA: true,
      }),
    )
      .toEqual(
        new Matrix(
          [2, 2],
          [0, 1, 1, 1],
        ),
      );
  });

  it("should handle square matrix multiplication with matrix B transposed", async () => {
    expect(
      await sgemm({
        matrixA: squareMatrixOne,
        matrixB: squareMatrixOne,
        transB: true,
      }),
    )
      .toEqual(
        new Matrix(
          [2, 2],
          [2, 1, 1, 1],
        ),
      );
  });

  it("should handle square matrix multiplication with matrix A and B transposed", async () => {
    expect(
      await sgemm({
        matrixA: squareMatrixOne,
        matrixB: squareMatrixOne,
        transA: true,
        transB: true,
      }),
    )
      .toEqual(
        new Matrix(
          [2, 2],
          [1, 0, 2, 1],
        ),
      );
  });

  it("should handle the additional of third matrix scaled by a beta scalar", async () => {
    expect(
      await sgemm({
        matrixA: squareMatrixOne,
        matrixB: squareMatrixOne,
        matrixC: squareMatrixOne,
        beta: 0.5
      }),
    )
      .toEqual(
        new Matrix(
          [2, 2],
          [1.5, 2.5, 0, 1.5],
        ),
      );
  });
});
