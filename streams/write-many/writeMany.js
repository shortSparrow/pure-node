// // ###### 1
// const fs = require("fs/promises");

// // Duration time: ~10s
// // CPU: ~100% (one core)
// // Memory Usage: ~50MB
// async function fillFatFile() {
//   try {
//     console.time("fillFatFile");
//     // this approach more faster. Probably because we open file only once
//     const existingFileHandler = await fs.open("./fat_file.txt", "w");
//     for (let i = 0; i < 1_000_000; i++) {
//       await existingFileHandler.write(`${i}\n`);
//     }
//     existingFileHandler.close();

//     // this approach takes more time.
//     // for (let i = 0; i < 1000_000; i++) {
//     //   await fs.appendFile("./fat_file.txt", `${i}\n`);
//     // }
//   } catch (e) {
//     console.log("Error: ", e);
//   }
//   console.timeEnd("fillFatFile");
// }

// fillFatFile();

// // ###### 2
// const fs = require("fs");
// function fillFatFileCallback() {
//   try {
//     console.time("fillFatFileCallback");
//     fs.open("./fat_file.txt", "w", (error, fileDescriptor) => {
//       for (let i = 0; i < 1_000_000; i++) {
//         fs.writeSync(fileDescriptor, `${i}\n`); // Duration time: ~1.8s;  Memory: ~30MB (this is memory safe. Increasing amount of data will not increase memory usage)
//         // fs.write(fileDescriptor, `${i}\n`, () => {}); // Duration time: ~1.2s; Memory: ~800MB. BUT order of number is random!
//       }
//       console.timeEnd("fillFatFileCallback");
//     });

//   } catch (e) {
//     console.log("Error: ", e);
//   }
// }

// fillFatFileCallback();

/*
fs.writeSync() is a synchronous operation that waits for the write to complete before moving on to the next one. This has the advantage of maintain the correct order, but at the cost of blocking the event loop during the operation. However, because it's synchronous, it doesn't need to create large buffers to hold data while waiting for I/O operations to complete, which is why it uses much lesser memory (~30MB). Synchronous operations still consume some memory due to the overhead of the function and the string operations, but this is minimal compared to what the asynchronous operations require.

On the other hand, fs.write() is an asynchronous operation that doesn't wait for a write to finish before starting the next one. It starts all the writes almost at once. Because Node.JS is built on JavaScript, which is single-threaded, the order is not guaranteed (hence why the output is random).

The asynchronous write requires much more memory (~800MB) because it has to create buffers for all the data that has been requested to be written before those write operations actually complete - which can lead to higher memory usage when writing a high volume of data.
*/

// // ###### 3
// // ! DON'T DO THIS WAY (TOO MUCH MEMORY, if I add 1 or 2 zeros to 1000_000 memory may will increase to a few GB)
// const fs = require("fs/promises");

// // Duration time: ~200.696ms
// // Memory Usage: ~200MB
// async function fillFatFile() {
//   try {
//     console.time("fillFatFile");
//     const fileHandler = await fs.open("./fat_file.txt", "w");
//     const stream = fileHandler.createWriteStream();

//     for (let i = 0; i < 1000_000; i++) {
//       const buff = Buffer.from(`${i}\n`, "utf-8");
//       stream.write(buff);
//     }

//     fileHandler.close();
//   } catch (e) {
//     console.log("Error: ", e);
//   }
//   console.timeEnd("fillFatFile");
// }

// fillFatFile();

// // ###### 4
// const fs = require("fs/promises");
// async function fillFatFile() {
//   const fileHandler = await fs.open("./fat_file.txt", "w");
//   const stream = fileHandler.createWriteStream();
//   console.log(stream.writableHighWaterMark); // 16384 bytes -> ~16Kb. This is size of our stream (amount of data which it can take in one chunk)
//   console.log(stream.writableLength); // 0 bytes
//   stream.write("Hi");
//   // // we can as write directly like stream.write("Hi"), as using Buffer
//   // const buff = Buffer.from('Hi', 'utf-8')
//   // stream.write(buff)

//   console.log(stream.writableLength); // 2 bytes

//   fileHandler.close();
// }

// fillFatFile();

// // ###### 4
// const fs = require("fs/promises");
// async function fillFatFile() {
//   const fileHandler = await fs.open("./fat_file.txt", "w");
//   const stream = fileHandler.createWriteStream();
//   console.log(stream.writableHighWaterMark); // 16384 bytes -> ~16Kb. This is size of our stream (amount of data which it can take in one chunk)

//   // const buff = Buffer.alloc(100, "a");
//   // console.log(stream.write(buff)); // true

//   // const buff = Buffer.alloc(stream.writableHighWaterMark - 1, "a");
//   // console.log(stream.write(buff)); // true

//   const buff = Buffer.alloc(stream.writableHighWaterMark, "a");
//   console.log(stream.write(buff)); // false. File was filled, but return false

//   stream.on("drain", () => {
//     console.log("We are noe safe to write more");
//     stream.write("XXX");
//   });
// }

// fillFatFile();

// ###### 5
const fs = require("fs/promises");

// Duration time: ~280ms
// Memory Usage: ~50Mb (Much lover, and we may don't worry about loop with 1_000_000_000 iteration, because memory will not  increase, only time)
// * This allow me use stream and write all 1_000_000 bytes event is chunk for stream is 16384 bytes. Because every time when chunk is over I can listen it on stream.on("drain"
async function fillFatFile() {
  console.time("fillFatFile");
  const fileHandler = await fs.open("./fat_file.txt", "w");
  const stream = fileHandler.createWriteStream();
  let i = 0;
  const writeMany = () => {
    while (i < 1_000_0000) {
      const buff = Buffer.from(`${i}\n`, "utf-8");

      // is stream.write returns false, stop loop
      const isFull = !stream.write(buff);
      i++;

      // this is our last write
      if (i === 1_000_0000) {
        stream.end();
        return;
      }
      if (isFull) break;
    }
  };

  writeMany();

  // resume our loop one our stream's internal buffer is empty
  stream.on("drain", () => {
    console.log("drain: ",  i);
    writeMany();
  });

  stream.on("finish", () => {
    console.timeEnd("fillFatFile");
    fileHandler.close();
  });
}

fillFatFile();

/*
The stream.write() function uses internal buffering to store the data until it can be written to the file system. When the buffering limit is hit, it returns false, indicating the buffer is full and it is not ready to take more data. On the other hand, when it is ready to take more data (the internal buffer is empty), it emits a 'drain' event.
If you are not checking the return value of stream.write() or listening for 'drain' events. You are writing continuously, regardless of the state of the Stream's internal buffer. This will keep adding the data to the internal buffer and as the buffer fills up, the amount of memory consumed also increases.

This is why example 3 may takes gigabytes of memory and event createHash, instead of example 5
*/