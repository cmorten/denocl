/**
 * get
 * 
 * Maps the source GPUBuffer and gets it's mapped range.
 * 
 * @param {GPUBuffer} opts.src The source buffer
 * @returns {ArrayBuffer} The mapped range
 */
export async function get(
  { src }: { src: GPUBuffer },
): Promise<ArrayBuffer> {
  await src.mapAsync(GPUMapMode.READ);

  return src.getMappedRange().slice(0);
}
