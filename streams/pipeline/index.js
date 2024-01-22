const fs = require("node:fs/promises");
const { pipeline } = require("node:stream");

const init = async () => {
  console.time("init");
  const srcFile = await fs.open("../fat_file.txt", "r");
  const destFile = await fs.open("./dest.txt", "w");

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  pipeline(readStream, writeStream, (err) => {
    console.log(err); // undefined - because no error
  });

  readStream.on("end", () => {
    console.timeEnd("init");
  });
};

init();
