const fs = require("node:fs/promises");

// // ######## 1
// // don't work for large file. App wil crash, and memory consuming will be huge
// const init = async () => {
//   const destFile = await fs.open("./dest.txt", "w");
//   const result = await fs.readFile("../fat_file.txt");

//   await destFile.write(result);
// };

// init();

// // ######## 2
// Safe memory consuming but can be slower
const init = async () => {
  const srcFile = await fs.open("../fat_file.txt", "r");
  const destFile = await fs.open("./dest.txt", "w");

  let bytesRead = -1;
  while (bytesRead !== 0) {
    const readResult = await srcFile.read(); // read() has own size 16384
    bytesRead = readResult.bytesRead;

    if (bytesRead !== 16384) {
      const indexOfNotFilled = readResult.buffer.indexOf(0);
      const newBuffer = Buffer.alloc(indexOfNotFilled);
      readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
      destFile.write(newBuffer);
    } else {
      destFile.write(readResult.buffer);
    }
  }
};

init();
