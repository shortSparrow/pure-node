const { Buffer } = require("buffer");

console.time('buffer')
const buffer = Buffer.alloc(10000, 0); // allocate 10000 and fill 0 (0 this is default, so you may don't write 0)
console.timeEnd('buffer') // buffer: 0.079ms

console.time('unsafeBuffer')
const unsafeBuffer = Buffer.allocUnsafe(10000); // faster because don't rewrite bytes, just take their values as they are
console.timeEnd('unsafeBuffer') // unsafeBuffer: 0.02ms


// for (let i = 0; i < unsafeBuffer.length; i++) {
//   if (unsafeBuffer[i] !== 0) {
//     console.log(
//       `Element at position ${i} has value: ${unsafeBuffer[i].toString(2)}`
//     );
//   }
// }

console.log( Buffer.poolSize) // 8192 . When you run your node application, node allocate around 8 KiB in RAM. And you can use it for allocation in your app
console.log(Buffer.poolSize >>> 1) // 4096

//  Buffer.allocUnsafe(...) If I allocate (...) bytes and it less than Buffer.poolSize >>> 1 that means I allocate data in Buffer.poolSize pool. This is the fastest way to allocate space.
// Buffer.alloc can't use Buffer.poolSize. Buffer.poolSize only for allocUnsafe
//  Buffer.poolSize >>> 1 це по суті ділення на 2. Decimal 60 in binary -> 1111 00 >>> 1 -> 0111 10 -> 30 in decimal. Using this approach computers make division
//  1000 >>> 1 = 500
//  1000 >>> 2 = 250
//  1000 >>> 3 = 125


// Buffer.allocUnsafeSlow(2); // This method will not try to use Buffer.poolSize
console.time('allocUnsafeSlow')
const allocUnsafeSlow = Buffer.allocUnsafeSlow(10000); // Should slower allocUnsafe because allocate new space of memory. But in reality faster, I don't know why.
console.timeEnd('allocUnsafeSlow') // allocUnsafeSlow: 0.011ms
// Можливо, у випадку, коли розробнику може знадобитися утримувати невелику ділянку пам'яті з пулу протягом невизначеного часу, може бути доцільним створити екземпляр Buffer без пулу за допомогою Buffer.allocUnsafeSlow(), а потім вилучити відповідні біти.