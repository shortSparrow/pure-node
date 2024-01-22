// ###### 1
// const fs = require("fs/promises");

// const readBig = async () => {
//   const fileHandler = await fs.open("./fat_file.txt", "r");
//   const stream = fileHandler.createReadStream();

//   // we receive multiple chunks of data
//   stream.on("data", (chunk) => {
//     console.log("--------");
//     console.log(chunk);
//     console.log(chunk.length); // 65536 bytes (for writableStream is was 16384 bytes). We can change the value by passing argument createReadStream({highWaterMark: 400})
//   });

// };

// readBig();

// // ###### 2
// // dest.txt is empty, fat_file.txt if filled. After call this code we will read fat_file and write his all data to dest
// // ! And again without drain we will have large memory consuming. If we try to copy 10GB file my laptop may crash
// const fs = require("fs/promises");
// const readBig = async () => {
//   const fileHandlerRead = await fs.open("./fat_file.txt", "r");
//   const fileHandlerWrite = await fs.open("./dest.txt", "w");

//   const streamRead = fileHandlerRead.createReadStream();
//   const streamWrite = fileHandlerWrite.createWriteStream();

//   streamRead.on("data", (chunk) => {
//     streamWrite.write(chunk);
//   });
// };

// readBig();

// // ###### 3
// // dest.txt is empty, fat_file.txt if filled. After call this code we will read fat_file and write his all data to dest
// // * This approach don'y consume much memory
// const fs = require("fs/promises");
// const readBig = async () => {
//   const fileHandlerRead = await fs.open("./fat_file.txt", "r");
//   const fileHandlerWrite = await fs.open("./dest.txt", "w");

//   const streamRead = fileHandlerRead.createReadStream();
//   const streamWrite = fileHandlerWrite.createWriteStream();

//   // Оскільки по дефолту highWaterMark у streamRead більше ніж у streamWrite, тож на кожен streamRead.on("data") ми будемо мати у streamWrite.write(chunk) false, тож ставимо його на паузу streamRead і поновимо тільки коли streamWrite повідомить що він готовий до нової пачки даних, тобто тільки після streamWrite.on("drain")
//   streamRead.on("data", (chunk) => {
//     if (!streamWrite.write(chunk)) {
//       streamRead.pause();
//     }
//   });
//   streamRead.readableHighWaterMark;
//   streamWrite.writableHighWaterMark;
//   streamWrite.on("drain", () => {
//     streamRead.resume();
//   });
// };

// readBig();

// ###### 4
const fs = require("fs/promises");
const readBig = async () => {
  const fileHandlerRead = await fs.open("../fat_file.txt", "r");
  const fileHandlerWrite = await fs.open("./dest.txt", "w");

  const streamRead = fileHandlerRead.createReadStream();
  const streamWrite = fileHandlerWrite.createWriteStream();

  let split = "";
  streamRead.on("data", (chunk) => {
    const numbers = chunk.toString("utf-8").split("\n");

    // if first item !== second item -1 this means that chunk is corrupted (highWaterMark could be full and can't contain all number, and just separate last number, for example if number 193134 chunk could contain only 193, and rest 134 will be in next chunk)
    if (Number(numbers[0]) !== Number(numbers[1]) - 1) {
      if (split) {
        numbers[0] = split.trim() + numbers[0].trim();
        split = "";
      }
    }

    // if last item !== second last item + 1 this means that chunk is corrupted (highWaterMark could be full and can't contain all number, and just separate last number, for example if number 193134 chunk could contain only 193, and rest 134 will be in next chunk)
    if (
      Number(numbers[numbers.length - 2]) + 1 !==
      Number(numbers[numbers.length - 1])
    ) {
      split = numbers.pop(); // pop - remove last elements of arr and return it
    }

    /*
      without this if's we receive ['6','7216777'] 
      but after checking last and first number we receive  ['7216776','7216777']
    */
    console.log(numbers);

    if (!streamWrite.write(chunk)) {
      streamRead.pause();
    }
  });

  streamWrite.on("drain", () => {
    streamRead.resume();
  });
};

readBig();
