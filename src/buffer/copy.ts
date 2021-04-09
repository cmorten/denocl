import { create } from "./create.ts";
import { createCommandEncoder } from "../device/createCommandEncoder.ts";
import { submit } from "../queue/submit.ts";

/**
 * copy
 * 
 * Copies the provided unmapped source GPUBuffer into a new 
 * unmapped GPUBuffer.
 * 
 * @param {GPUBuffer} opts.src A mapped source buffer
 * @param {number} opts.size The size of the source buffer
 * @returns {Promise<GPUBuffer>} A copy of the source buffer
 */
export async function copy(
  { src, size, commandEncoder }: {
    src: GPUBuffer;
    size: number;
    commandEncoder?: GPUCommandEncoder;
  },
): Promise<GPUBuffer> {
  const dest = await create({
    size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  const copyEncoder = commandEncoder ?? await createCommandEncoder();
  copyEncoder.copyBufferToBuffer(
    src,
    0,
    dest,
    0,
    size,
  );

  const copyCommands = copyEncoder.finish();

  submit([copyCommands]);

  return dest;
}
