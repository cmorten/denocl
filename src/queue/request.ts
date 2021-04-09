import { request as requestDevice } from "../device/request.ts";

/**
 * request
 * 
 * Requests the GPU device queue.
 * 
 * @returns {Promise<GPUQueue | null>} The device queue if available
 */
export async function request(): Promise<GPUQueue | null> {
  const device = await requestDevice();

  if (!device) {
    return null;
  }

  return device.queue;
}
