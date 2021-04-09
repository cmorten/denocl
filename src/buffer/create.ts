import { request } from "../device/request.ts";
import { error } from "../error.ts";

/**
 * create
 * 
 * Creates a new GPUBuffer based on the provided descriptor.
 * 
 * @param {GPUBufferDescriptor} descriptor The buffer descriptor
 * @returns {Promise<GPUBuffer>} The created buffer
 */
export async function create(
  descriptor: GPUBufferDescriptor,
): Promise<GPUBuffer> {
  const device = await request();

  if (!device) {
    return error({
      message: "webgpu is not supported",
      code: "DEVICE_NULL",
    });
  }

  return device.createBuffer(descriptor);
}
