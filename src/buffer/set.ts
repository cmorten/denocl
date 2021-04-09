/**
 * set
 * 
 * Sets the source array on the mapped destination GPUBuffer's mapped
 * range and unmaps the buffer.
 * 
 * @param {ArrayLike<number>} opts.src The source array like data
 * @param {GPUBuffer} opts.dest The destination buffer
 * @returns {void}
 */
export function set(
  { src, dest }: { src: ArrayLike<number>; dest: GPUBuffer },
): void {
  const arrayBuffer = dest.getMappedRange();
  new Float32Array(arrayBuffer).set(src);
  dest.unmap();
}
