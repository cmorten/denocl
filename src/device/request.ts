let device: GPUDevice | null;

export interface DenoCLDeviceRequestOptions {
  adaptor?: {
    options?: GPURequestAdapterOptions;
  };
  device?: {
    descriptor?: GPUDeviceDescriptor;
  };
}

/**
 * request
 * 
 * Requests the GPU adaptor and device with the provided options.
 * 
 * @param {DenoCLDeviceRequestOptions} [opts] Options for the GPU adaptor and device
 * @returns {Promise<GPUDevice | null>} A GPU device if available
 */
export async function request(
  { adaptor: { options } = {}, device: { descriptor } = {} }:
    DenoCLDeviceRequestOptions = {},
): Promise<GPUDevice | null> {
  if (typeof device !== "undefined") {
    return device;
  }

  const adapter = await navigator?.gpu.requestAdapter(options);

  if (!adapter) {
    return device = null;
  }

  return device = await adapter.requestDevice(descriptor);
}

/**
 * destroy
 */
export function destroy(): void {
  device?.destroy();
}
