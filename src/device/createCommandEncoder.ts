import { request } from "./request.ts";
import { error } from "../error.ts";

/**
 * createCommandEncoder
 * 
 * Creates a command encoder.
 * 
 * @returns {Promise<GPUCommandEncoder>} A command encoder
 */
export async function createCommandEncoder(): Promise<GPUCommandEncoder> {
  const device = await request();

  if (!device) {
    return error({
      message: "webgpu is not supported",
      code: "DEVICE_NULL",
    });
  }

  return device.createCommandEncoder();
}
