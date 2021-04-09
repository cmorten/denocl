import { request } from "./request.ts";
import { error } from "../error.ts";

/**
 * submit
 * 
 * Submits the provided commands to the GPU device queue.
 * 
 * @param {GPUCommandBuffer[]} commands An array of GPU commands
 * @returns {Promise<void>}
 */
export async function submit(commands: GPUCommandBuffer[]): Promise<void> {
  const queue = await request();

  if (!queue) {
    return error({
      message: "webgpu is not supported",
      code: "QUEUE_NULL",
    });
  }

  queue.submit(commands);
}
