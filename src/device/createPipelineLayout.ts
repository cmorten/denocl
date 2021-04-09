import { request } from "./request.ts";
import { error } from "../error.ts";

/**
 * createPipelineLayout
 * 
 * Creates a pipeline layout.
 * 
 * @param {GPUPipelineLayoutDescriptor} descriptor The pipeline layout descriptor
 * @returns {Promise<GPUPipelineLayout>} A bind group
 */
export async function createPipelineLayout(
  descriptor: GPUPipelineLayoutDescriptor,
): Promise<GPUPipelineLayout> {
  const device = await request();

  if (!device) {
    return error({
      message: "webgpu is not supported",
      code: "DEVICE_NULL",
    });
  }

  return device.createPipelineLayout(descriptor);
}
