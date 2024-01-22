const fs = require("fs/promises");
const { FileWriteStream } = require("./custom-writable-stream");

// Copy code from write many, and reaplce createWriteStream with our implementation
async function fillFatFile() {
  console.time("fillFatFile");
//   const fileHandler = await fs.open("../fat_file.txt", "w");
//   const stream = fileHandler.createWriteStream();
  const stream = new FileWriteStream({
    hightWaterMark: 1800,
    fileName: "text.txt",
  });
  let i = 0;
  const writeMany = () => {
    while (i < 1_000_000) {
      const buff = Buffer.from(`${i}\n`, "utf-8");

      // is stream.write returns false, stop loop
      const isFull = !stream.write(buff);
      i++;

      // this is our last write
      if (i === 1_000_000) {
        stream.end();
        return;
      }
      if (isFull) break;
    }
  };

  writeMany();

  // resume our loop one our stream's internal buffer is empty
  stream.on("drain", () => {
    console.log("drain: ", i);
    writeMany();
  });

  stream.on("finish", () => {
    console.timeEnd("fillFatFile");
    // fileHandler.close();
  });
}

fillFatFile();
