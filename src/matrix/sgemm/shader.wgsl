[[builtin(global_invocation_id)]]
var globalInvocationId: vec3<u32>;

[[block]]
struct Matrix {
  size: vec2<f32>;
  numbers: [[stride(4)]] array<f32>;
};

[[block]]
struct Meta {
  alpha: f32;
  beta: f32;
  transA: f32;
  transB: f32;
};

[[group(0), binding(0)]]
var<storage> matrixA: [[access(read)]] Matrix;

[[group(0), binding(1)]]
var<storage> matrixB: [[access(read)]] Matrix;

[[group(0), binding(2)]]
var<storage> meta: [[access(read)]] Meta;

[[group(0), binding(3)]]
var<storage> matrixC: [[access(read_write)]] Matrix;

[[stage(compute), workgroup_size(1)]]
fn main() {
  var row: i32 = globalInvocationId.x;
  var col: i32 = globalInvocationId.y;

  var sum: f32 = 0.0;
  var i: i32 = 0;
  var index: i32;

  if (meta.transA > 0) {
    if (meta.transB > 0) {
      // C = alpha * A^T * B^T + beta * C
      matrixC.size = vec2<f32>(matrixA.size.y, matrixB.size.x);

      loop {
        if (i >= matrixA.size.x) { 
          break;
        }

        var a: i32 = i + row * matrixA.size.x;
        var b: i32 = col + i * matrixB.size.x;
        sum = sum + matrixA.numbers[a] * matrixB.numbers[b];
        i = i + 1;
      }

      index = col + row * matrixB.size.x;
    } else {
      // C = alpha * A^T * B + beta * C
      matrixC.size = vec2<f32>(matrixA.size.y, matrixB.size.y);

      loop {
        if (i >= matrixA.size.x) { 
          break;
        }

        var a: i32 = i + row * matrixA.size.x;
        var b: i32 = col + i * matrixB.size.y;
        sum = sum + matrixA.numbers[a] * matrixB.numbers[b];
        i = i + 1;
      }

      index = col + row * matrixB.size.y;
    }
  } else {
     if (meta.transB > 0) {
       // C = alpha * A * B^T + beta * C
       matrixC.size = vec2<f32>(matrixA.size.x, matrixB.size.x);

      loop {
        if (i >= matrixA.size.y) { 
          break;
        }

        var a: i32 = i + row * matrixA.size.y;
        var b: i32 = col + i * matrixB.size.x;
        sum = sum + matrixA.numbers[a] * matrixB.numbers[b];
        i = i + 1;
      }

      index = col + row * matrixB.size.x;
    } else {
      // C = alpha * A * B + beta * C
      matrixC.size = vec2<f32>(matrixA.size.x, matrixB.size.y);

      loop {
        if (i >= matrixA.size.y) { 
          break;
        }

        var a: i32 = i + row * matrixA.size.y;
        var b: i32 = col + i * matrixB.size.y;
        sum = sum + matrixA.numbers[a] * matrixB.numbers[b];
        i = i + 1;
      }

      index = col + row * matrixB.size.y;
    }
  }

  matrixC.numbers[index] = meta.alpha * sum + meta.beta * matrixC.numbers[index];
}