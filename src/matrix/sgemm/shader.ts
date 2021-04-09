import { request } from "../../device/request.ts";
import { error } from "../../error.ts";

const source = await Deno.readTextFile(
  new URL("./shader.wgsl", import.meta.url),
);

let shaderModule: GPUShaderModule;

export async function shader(): Promise<GPUShaderModule> {
  if (shaderModule) {
    return shaderModule;
  }

  const device = await request();

  if (!device) {
    return error({
      message: "webgpu is not supported",
      code: "DEVICE_NULL",
    });
  }

  const module = device.createShaderModule({ code: await source });

  return module;
}
