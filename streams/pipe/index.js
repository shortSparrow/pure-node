const fs = require("node:fs/promises");

// Time: 59.287ms
// Calling the stream.pipe() method to send the data to a Writable. Could be called only on readable stream
// In production I should avoid using pipe, because poor error handling available. Better use pipeline
const init = async () => {
  console.time("init");
  const srcFile = await fs.open("../fat_file.txt", "r");
  const destFile = await fs.open("./dest.txt", "w");

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  readStream.pipe(writeStream);

  readStream.on("end", () => {
    console.timeEnd("init");
  });
};

init();
