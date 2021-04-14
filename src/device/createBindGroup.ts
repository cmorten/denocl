import { request } from "./request.ts";
import { error } from "../error.ts";

/**
 * createBindGroup
 * 
 * Creates a bind group.
 * 
 * @param {GPUBindGroupDescriptor} descriptor The bind group descriptor
 * @returns {Promise<GPUBindGroup>} A bind group
 */
export async function createBindGroup(
  descriptor: GPUBindGroupDescriptor,
): Promise<GPUBindGroup> {
  const device = await request();

  if (!device) {
    return error({
      message: "webgpu is not supported",
      code: "DEVICE_NULL",
    });
  }

  return device.createBindGroup(descriptor);
}
