const { Buffer } = require("buffer");

// const memoryContainer = Buffer.alloc(4); // allocate 4 bytes (32 bits)

// const firstByte = memoryContainer[0];

// console.log(firstByte); // 0 - data represent in decimal
// console.log(memoryContainer); // <Buffer 00 00 00 00> - data represent in hexadecimal
// // Hexadecimal means that each 4 bits (0000) encoding with one character from 0 up to F (0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F) - totally 16 characters

// memoryContainer[0] = 0xf4; // 1111 0100
// // memoryContainer[0] = 0xffff; // write only first two chunks 1111 1111, second 1111 1111 will be ignored and buffer will be  <Buffer ff 00 00 00>

// console.log(memoryContainer[0]) // 244
// console.log(memoryContainer) // <Buffer f4 00 00 00>



//####################################################################################


// How to write negative number? You can directly set negative number like
// const memoryContainer = Buffer.alloc(4); // allocate 4 bytes (32 bits)
// memoryContainer[0] = -32;
// console.log(memoryContainer); // <Buffer e0 00 00 00> Negative numbers writes as positive. This is -32 but in hex this is positive e0 in hex. Positive 32 will be 20 in hex

// memoryContainer[0] = 0
// // But this is bad way, better to use specific methods:
// memoryContainer.writeInt8(-32,0) // 0 here this is a position -> change memoryContainer[0] to -32
// console.log(memoryContainer) // <Buffer e0 00 00 00>
// console.log(memoryContainer.readInt8(0)) // -32

// // writeInt8 or writeInt16 or writeInt32 means how many bytes we want allocate under our number



// //####################################################################################


// const memoryContainer = Buffer.alloc(4); // allocate 4 bytes (32 bits)

//  memoryContainer[0] = 0xf4
//  memoryContainer[1] = 0x32
//  memoryContainer[2] = 0x00
//  memoryContainer[3] = 0xff

//  console.log(memoryContainer) // <Buffer f4 32 00 ff>
//  console.log(memoryContainer.toString()) // �2�
//  console.log(memoryContainer.toString('base64')) // 9DIA/w==
//  console.log(memoryContainer.toString('hex')) // f43200ff


//####################################################################################


// const buff = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]); // from automatically allocate need space for you
// console.log(buff.toString()) // buffer


// const buff = Buffer.from("627566666572", "hex"); 
// console.log(buff.toString()) // buffer

// const buff = Buffer.from("string", "utf-8"); 
// console.log(buff) // <Buffer 73 74 72 69 6e 67>
// console.log(buff.toString()) // string

// const buff = Buffer.from("F09F909D", "hex"); 
// console.log(buff.toString()) // 🐝


// Looks like url understand only ASCII characters, any other characters encoding with hex
// For example ☸ emoji in hex E2 98 B8. If I enter in search in Chrome and see address uel in devtools I will see
// https://www.google.com/search?q=%E2%98%B8&oq=%E2%98%B8&.........ie=UTF-8
// %E2%98%B8 this is encoding to hex
// If I paste character ї (in hex D1 97) -> https://www.google.com/search?q=%D1%97&.....


// If I allocate too much memory my computer will crash. For example if I crate VM with Ubuntu and 3 gigabytes of memory and than allocate this 2GB VM will crash