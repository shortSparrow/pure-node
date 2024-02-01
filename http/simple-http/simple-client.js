// #################### 1
// fetch("http://localhost:8050/", {
//   method: "POST",
//   body:  Buffer.alloc(40824),
// });

// fetch("http://localhost:8050/", {
//   method: "POST",
//   body:  Buffer.alloc(440824),
// });

// #################### 2
// ! Difference between send Buffer and Buffer.toJSON

// fetch("http://localhost:8050/", {
//   method: "POST",
//   body: JSON.stringify(Buffer.from("Hi")), // response length 33 ( chunk -> <Buffer 7b 22 74 79 70 65 22 3a 22 42 75 66 66 65 72 22 2c 22 64 61 74 61 22 3a 5b 37 32 2c 31 30 35 5d 7d> ;;;; chunk.toString() -> {"type":"Buffer","data":[72,105]})
// });

// fetch("http://localhost:8050/", {
//   method: "POST",
//   body: Buffer.from("Hi").toJSON().data, // response length 6 ( chunk -> <Buffer 37 32 2c 31 30 35> ;;;; chunk.toString() -> 72,105)
// });

// fetch("http://localhost:8050/", {
//   method: "POST",
//   body: Buffer.from("Hi"), // response length 2 ( chunk -> <Buffer 48 49> ;;;; chunk.toString() -> Hi)
// });

/**
 *
 * Buffer.from("Hi") -> <Buffer 48 49>
 * When you use .toJSON() or JSON.stringify this convert HEX into decimal numbers (standard number system)
 *
 * JSON.stringify !== Buffer.toJSON(). Result looks similar but remember JSON.stringify return string, but toJSON return object (see on "" and '' in examples below)
 *
 * JSON.stringify(Buffer.from("Hi")) -> {"type":"Buffer","data":[72 105]} -> <Buffer 5b 6f 62 6a 65 63 74 20 4f 62 6a 65 63 74 5d> -> [object Object]
 *
 * Buffer.from("Hi").toJSON()        -> { type: 'Buffer', data: [ 72, 105 ] }
 *                                   -> <Buffer 7b 22 74 79 70 65 22 3a 22 42 75 66 66 65 72 22 2c 22 64 61 74 61 22 3a 5b 37 32 2c 31 30 35 5d 7d>
 *                                   -> {"type":"Buffer","data":[72,105]}
 *
 * * Why when body: Buffer.from("HI") server receive response length 2, but when body: JSON.stringify(Buffer.from("Hi")) response length 6?
 * HEX <Buffer 48 49> => Decimal 72,105 => HEX  <Buffer 37 32 2c 31 30 35> => 37 -> 7; 32 -> 2; 2C -> ,; 31 -> 1; 30 -> 0; 35 -> 5; що є (72, 105) перетвореним в HEX
 * Тобто ми перетворюємо в String <Buffer 48 49> коли робимо .toJSON() і отримуємо String 72,105, і щоб передати їх через TCP знову перетворюємо в hex через що і отримуємо <Buffer 37 32 2c 31 30 35>
 *
 */
