// Creating fat file for other scripts. Run this command to create fat_file.txt
const fs = require("fs/promises");

async function fillFatFile() {
  const existingFileHandler = await fs.open("./fat_file.txt", "w");
  for (let i = 0; i < 1_000_000; i++) {
    await existingFileHandler.write(`${i}\n`);
  }
  existingFileHandler.close();
}
fillFatFile()