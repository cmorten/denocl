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
import { submit } from "../../queue/submit.ts";

const BUFFER_TYPE_READ_ONLY_STORAGE = "read-only-storage";
const BUFFER_TYPE_STORAGE = "storage";

/**
 * Define how resources can be accessed in the GPU shader.
 */
const bindGroupLayout = await createBindGroupLayout({
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: BUFFER_TYPE_READ_ONLY_STORAGE,
      },
    },
    {
      binding: 1,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: BUFFER_TYPE_READ_ONLY_STORAGE,
      },
    },
    {
      binding: 2,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: BUFFER_TYPE_STORAGE,
      },
    },
    {
      binding: 3,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: BUFFER_TYPE_READ_ONLY_STORAGE,
      },
    },
  ],
});

/**
 * Define the mapping between the BindGroups and render / compute the shaders.
 */
const pipelineLayout = await createPipelineLayout({
  bindGroupLayouts: [bindGroupLayout],
});

/**
 * Create a pipeline that will compile the shader source.
 */
const computePipeline = await createComputePipelineAsync({
  layout: pipelineLayout,
  compute: { module: await shader(), entryPoint: "main" },
});

/**
 * sgemm
 * 
 * Single precision general matrix multiplication.
 * 
 * C <- alpha * op(A) * op(B) + beta * C
 * 
 * Where op() is either A -> A or A -> A^T based on the transA and transB arguments.
 * 
 * @param {Float32Array} opts.matrixA The first matrix in the multiplication.
 * @param {Float32Array} opts.matrixB The second matrix in the multiplication.
 * @param {Float32Array} opts.[matrixC] Optional matrix which is scaled by beta, added to the result and
 * then overwritten as the output matrix. C <- alpha * op(A) * op(B) + beta * C.
 * @param {number} opts.[alpha] Scalar alpha to multiply the result by. Default: 1.
 * @param {number} opts.[beta] Scalar beta to multiply matrix C by before adding to the result. Default: 0.
 * @param {boolean} opts.[transA] Use the transpose of matrix A. Default: false.
 * @param {boolean} opts.[transB] Use the transpose of matrix B. Default: false.
 * @returns {Float32Array} The matrix multiplication result.
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
  const M = matrixA[+transA];
  const N = matrixB[+!transB];

  const matrixCBufferSize = Float32Array.BYTES_PER_ELEMENT * (2 + M * N);
  const meta = new Float32Array([alpha, beta, +transA, +transB]);

  /**
   * Create unmapped buffers of matrices and metadata.
   */
  const matrixABuffer = await createStorageBuffer({ data: matrixA });
  const matrixBBuffer = await createStorageBuffer({ data: matrixB });
  const matrixCBuffer = await createSourceBuffer({
    data: matrixC,
    size: matrixCBufferSize,
    beta,
  });
  const metaBuffer = await createStorageBuffer({ data: meta });

  /**
   * Bind the runtime memory to the bindGroupLayout defined earlier.
   */
  const bindGroup = await createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: matrixABuffer,
          size: matrixA.byteLength,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: matrixBBuffer,
          size: matrixB.byteLength,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: matrixCBuffer,
          size: matrixCBufferSize,
        },
      },
      {
        binding: 3,
        resource: {
          buffer: metaBuffer,
          size: meta.byteLength,
        },
      },
    ],
  });

  /**
   * Bind the compiled source and bind group, and dispatch the parameters.
   */
  const commandEncoder = await createCommandEncoder();

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatch(M, N, 1);
  passEncoder.endPass();

  submit([commandEncoder.finish()]);

  /**
   * Copy the result back from the GPU to the CPU.
   */
  const matrixResultBuffer = await copy({
    src: matrixCBuffer,
    size: matrixCBufferSize,
  });

  const result = await get({ src: matrixResultBuffer });

  /**
   * Clean up resources.
   */
  matrixABuffer.destroy();
  matrixBBuffer.destroy();
  matrixCBuffer.destroy();
  metaBuffer.destroy();
  matrixResultBuffer.destroy();

  return Matrix.from(result);
}

/**
 * createStorageBuffer
 * 
 * @param {Float32Array} opts.data The matrix data.
 * @returns {Promise<GPUBuffer>}
 * 
 * @private
 */
async function createStorageBuffer(
  { data }: { data: Float32Array },
): Promise<GPUBuffer> {
  const buffer = await create({
    mappedAtCreation: true,
    size: data.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });

  set({ src: data, dest: buffer });

  return buffer;
}

/**
 * createSourceBuffer
 * 
 * @param {Float32Array} opts.[data] The matrix data.
 * @param {Float32Array} opts.size The buffer size.
 * @param {Float32Array} opts.beta The beta value.
 * @returns {Promise<GPUBuffer>}
 * 
 * @private
 */
async function createSourceBuffer({ data, size, beta }: {
  data?: Float32Array;
  size: number;
  beta: number;
}) {
  const isMapped = data instanceof Float32Array && beta !== 0;

  const buffer = await create({
    mappedAtCreation: isMapped,
    size: size,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  if (isMapped) {
    set({ src: data as Float32Array, dest: buffer });
  }

  return buffer;
}
