const { Transform } = require("node:stream");
const fs = require("node:fs/promises");
const { pipeline } = require("node:stream/promises");

class Encrypt extends Transform {
  _transform(chunk, encoding, callback) {
    // chunk is buffer, you can use callback(null, chunk) for push data
    // callback(null, chunk);

    // const a = chunk.toString().split('').map((item) => item + 'X').join('')
    // callback(null, Buffer.from(a)); // TXhXiXsX XiXsX XsXoXmXeX XtXeXxXtX XtXoX XrXeXaXdX

    // callback(null, Buffer.from(chunk).map((item) => item >> 1)); // *449499762:2<::79202

    // callback(null, Buffer.from(chunk).map((item) => item + 1)); // Uijt!jt!tpnf!ufyu!up!sfbe
    
    callback(
      null,
      Buffer.from(chunk).map((item) => item + 1)
    );

    // callback(null,
    //   Buffer.from(chunk).map((item) => {
    //     if (item + 1 !== 255) { // you can do some handling if want
    //       return item + 1;
    //     }
    //   })
    // );
  }
}

const init = async () => {
  const readFileHandler = await fs.open("./read.txt", "r");
  const writeFileHandler = await fs.open("./encrypted.txt", "w");

  const readStream = readFileHandler.createReadStream();
  const writeStream = writeFileHandler.createWriteStream();

  const encrypt = new Encrypt();

  // readStream.pipe(encrypt).pipe(writeStream) // the same as pipeline. Better use pipeline, because they has error handling
  await pipeline(readStream, encrypt, writeStream);
};

init();
