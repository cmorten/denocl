import { Matrix } from "../matrix.ts";
import { create } from "../../buffer/create.ts";
import { set } from "../../buffer/set.ts";
import { copy } from "../../buffer/copy.ts";
import { get } from "../../buffer/get.ts";
import { createBindGroupLayout } from "../../device/createBindGroupLayout.ts";
import { createBindGroup } from "../../device/createBindGroup.ts";
import { createPipelineLayout } from "../../device/createPipelineLayout.ts";
import { createComputePipelineAsync } from "../../device/createComputePipelineAsync.ts";
import { createCommandEncoder } from "../../device/createCommandEncoder.ts";
import { shader } from "./shader.ts";

/**
 * sgemm
 * 
 * Single precision general matrix multiplication.
 * 
 * @param {Float32Array} matrixA The first matrix in the multiplication
 * @param {Float32Array} matrixB The second matrix in the multiplication
 * @param {Float32Array} [matrixC] Optional matrix which is scaled by beta, added to the result and
 * then overwritten as the output matrix. C = alpha * op(A) * op(B) + beta * C.
 * @param {number} [alpha] Scalar alpha to multiply the result by. Default: 1.
 * @param {number} [beta] Scalar beta to multiply matrix C by before adding to the result. Default: 0.
 * @returns {Float32Array} The matrix multiplication result
 */
export async function sgemm({
  matrixA,
  matrixB,
  matrixC,
  alpha = 1,
  beta = 0,
  transA = false,
  transB = false,
}: {
  matrixA: Float32Array;
  matrixB: Float32Array;
  matrixC?: Float32Array;
  alpha?: number;
  beta?: number;
  transA?: boolean;
  transB?: boolean;
}) {
  const gpuBufferResultMatrixSize = Float32Array.BYTES_PER_ELEMENT *
    (2 + matrixA[+transA] * matrixB[+!transB]);

  const gpuBufferMatrixA = await create({
    mappedAtCreation: true,
    size: matrixA.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });

  set({ src: matrixA, dest: gpuBufferMatrixA });

  const gpuBufferMatrixB = await create({
    mappedAtCreation: true,
    size: matrixB.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });

  set({ src: matrixB, dest: gpuBufferMatrixB });

  const metaMatrix = new Float32Array([alpha, beta, +transA, +transB]);

  const gpuBufferMeta = await create({
    mappedAtCreation: true,
    size: metaMatrix.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });

  set({ src: metaMatrix, dest: gpuBufferMeta });

  const isPrepopulatedResult = typeof matrixC !== "undefined" && beta !== 0;

  const gpuBufferResultMatrix = await create({
    mappedAtCreation: isPrepopulatedResult,
    size: gpuBufferResultMatrixSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  if (isPrepopulatedResult) {
    set({ src: matrixC as Float32Array, dest: gpuBufferResultMatrix });
  }

  const bindGroupLayout = await createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage",
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage",
        },
      },
      {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
    ],
  });

  const pipelineLayout = await createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const computePipeline = await createComputePipelineAsync({
    layout: pipelineLayout,
    compute: { module: await shader(), entryPoint: "main" },
  });

  const bindGroup = await createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: gpuBufferMatrixA,
          size: matrixA.byteLength,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: gpuBufferMatrixB,
          size: matrixB.byteLength,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: gpuBufferMeta,
          size: metaMatrix.byteLength,
        },
      },
      {
        binding: 3,
        resource: {
          buffer: gpuBufferResultMatrix,
          size: gpuBufferResultMatrixSize,
        },
      },
    ],
  });

  const commandEncoder = await createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatch(matrixA[+transA], matrixB[+!transB], 1);
  passEncoder.endPass();

  const gpuBufferReadMatrix = await copy({
    src: gpuBufferResultMatrix,
    size: gpuBufferResultMatrixSize,
    commandEncoder,
  });

  const result = await get({ src: gpuBufferReadMatrix });

  gpuBufferMatrixA.destroy();
  gpuBufferMatrixB.destroy();
  gpuBufferMeta.destroy();
  gpuBufferResultMatrix.destroy();
  gpuBufferReadMatrix.destroy();

  return Matrix.from(result);
}
