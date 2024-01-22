const { Transform } = require("node:stream");
const fs = require("node:fs/promises");
const { pipeline } = require("node:stream/promises");

class Decrypt extends Transform {
  _transform(chunk, encoding, callback) {
    callback(null, Buffer.from(chunk).map((item) => item - 1)) // This is some text to read
  }
}

const init = async () => {
  const readFileHandler = await fs.open("./encrypted.txt", "r");
  const writeFileHandler = await fs.open("./decrypted.txt", "w");

  const readStream = readFileHandler.createReadStream();
  const writeStream = writeFileHandler.createWriteStream();

  const decrypt = new Decrypt();

  await pipeline(readStream, decrypt, writeStream);
};

init();
