import { request } from "../../device/request.ts";
import { error } from "../../error.ts";

let module: GPUShaderModule;

/**
 * shader
 * 
 * Creates the sgemm shader module.
 * 
 * @returns {Promise<GPUShaderModule>} The sgemm shader module.
 */
export async function shader(): Promise<GPUShaderModule> {
  if (module) {
    return module;
  }

  const device = await request();

  if (!device) {
    return error({
      message: "webgpu is not supported",
      code: "DEVICE_NULL",
    });
  }

  return module = device.createShaderModule({
    code: await Deno.readTextFile(
      new URL("./shader.wgsl", import.meta.url),
    ),
  });
}
