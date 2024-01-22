const { Readable } = require("node:stream");
const fs = require("node:fs");

class FileReadStream extends Readable {
  constructor({ hightWaterMark, fileName }) {
    super({ hightWaterMark });
    this.fileName = fileName;
    this.fileDescriptor = null;
  }

  _construct(callback) {
    fs.open(this.fileName, "r", (err, fd) => {
      if (err) return callback(err);

      this.fileDescriptor = fd;
      callback();
    });
  }

  _read(size) {
    const buffer = Buffer.alloc(size);
    fs.read(this.fileDescriptor, buffer, 0, size, null, (err, bytesRead) => {
      if (err) return this.destroy(err);

      // push(null) is to indicate to end of the stream
      this.push(bytesRead > 0 ? buffer.subarray(0, bytesRead) : null); // subarray needed for avoiding reading empty characters. Buffer size may be 1000, but bytesRead only 30. In this case we push only 30 characters, and filter empty useless characters
    });
  }

  _destroy(error, callback) {
    if (this.fileDescriptor) {
      fs.close(this.fileDescriptor, (err) => callback(error || err));
    }
  }
}

// Usage Example 1:
// const stream = new FileReadStream({
//   fileName: "text.txt",
// });
// stream.on("data", (chunk) => {
//   console.log(chunk); // <Buffer 48 65 6c 6c 6f 20 74 68 65 72 65>
// });

// stream.on("end", () => {
//   console.log("Stream is done reading");
// });

// Usage Example 2:
const stream = new FileReadStream({
  fileName: "../fat_file.txt",
});
stream.on("data", (chunk) => {
  console.log(chunk); // many <Buffer...
});

stream.on("end", () => {
  console.log("Stream is done reading");
});
