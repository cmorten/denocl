import { request } from "./request.ts";
import { error } from "../error.ts";

/**
 * createBindGroupLayout
 * 
 * Creates a bind group layout.
 * 
 * @param {GPUBindGroupLayoutDescriptor} descriptor The bind group layout descriptor
 * @returns {Promise<GPUBindGroupLayout>} A bind group
 */
export async function createBindGroupLayout(
  descriptor: GPUBindGroupLayoutDescriptor,
): Promise<GPUBindGroupLayout> {
  const device = await request();

  if (!device) {
    return error({
      message: "webgpu is not supported",
      code: "DEVICE_NULL",
    });
  }

  return device.createBindGroupLayout(descriptor);
}
