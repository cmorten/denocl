import { request } from "./request.ts";
import { error } from "../error.ts";

/**
 * createComputePipelineAsync
 * 
 * Creates a compute pipeline.
 * 
 * @param {GPUComputePipelineDescriptor} descriptor The compute pipeline descriptor
 * @returns {Promise<GPUComputePipeline>} A compute pipeline
 */
export async function createComputePipelineAsync(
  descriptor: GPUComputePipelineDescriptor,
): Promise<GPUComputePipeline> {
  const device = await request();

  if (!device) {
    return error({
      message: "webgpu is not supported",
      code: "DEVICE_NULL",
    });
  }

  return await device.createComputePipelineAsync(descriptor);
}
