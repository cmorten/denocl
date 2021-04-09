export type DenoCLMatrixRows = number;
export type DenoCLMatrixColumns = number;
export type DenoCLMatrixShape = [DenoCLMatrixRows, DenoCLMatrixColumns];

export class Matrix extends Float32Array {
  constructor(public shape: DenoCLMatrixShape, public data: number[] | Float32Array) {
    super([...shape, ...data]);
  }

  /**
   * to2dArray
   * 
   * Converts the Matrix to it's 2-dimensional array representation.
   * 
   * @returns {number[][]} A 2-dimensional array
   */
  to2dArray(): number[][] {
    const [rows, columns] = this.shape;
    const array: number[][] = [];

    for (let row = 0; row < rows; row++) {
      array.push([]);

      for (let column = 0; column < columns; column++) {
        array[row][column] = this.data[row * columns + column];
      }
    }

    return array;
  }

  /**
   * from
   * 
   * Creates a matrix from an array like, array buffer like or iterable
   * instance.
   * 
   * @returns {Matrix}
   */
  static from(
    array: ArrayLike<number> | ArrayBufferLike | Iterable<number>,
  ): Matrix;
  static from(
    shape: DenoCLMatrixShape,
    array: ArrayLike<number> | ArrayBufferLike | Iterable<number>,
  ): Matrix;
  static from(shapeOrData: unknown, data?: unknown): Matrix {
    if (typeof data !== "undefined") {
      if (data instanceof ArrayBuffer) {
        return new Matrix(
          shapeOrData as DenoCLMatrixShape,
          new Float32Array(data).slice(2),
        );
      }

      const array = Array.from(data as ArrayLike<number> | Iterable<number>);

      return new Matrix(
        shapeOrData as DenoCLMatrixShape,
        new Float32Array(array),
      );
    }

    if (shapeOrData instanceof ArrayBuffer) {
      const array = new Float32Array(shapeOrData);

      return new Matrix([array[0], array[1]], array.slice(2));
    }

    const array = Array.from(
      shapeOrData as ArrayLike<number> | Iterable<number>,
    );

    return new Matrix([array[0], array[1]], new Float32Array(array.slice(2)));
  }
}
