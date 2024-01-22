const { Writable } = require("node:stream");
const fs = require("node:fs");

class FileWriteStream extends Writable {
  constructor({ hightWaterMark, fileName }) {
    super({ hightWaterMark });

    this.fileName = fileName;
    this.fileDescriptor = null;
    this.chunks = [];
    this.chunksSize = 0;
    this.numberOfWrites = 0;
  }

  // This will run after the constructor and it will put off all calling other methods until we  call the callback function
  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      if (err) {
        callback(err);
      } else {
        this.fileDescriptor = fd;
        // no arguments means it was successful
        callback();
      }
    });
  }

  _write(chunk, encoding, callback) {
    // do our operation....
    // console.log(this.fileDescriptor); // comment because this make code very slower (230.855ms vs 4s)
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;
    if (this.chunksSize > this.writableHighWaterMark) {
      fs.write(this.fileDescriptor, Buffer.concat(this.chunks), (err) => {
        if (err) {
          return callback(err);
        }
        this.chunks = [];
        this.chunksSize = 0;
        ++this.numberOfWrites;
        callback();
      });
    } else {
      callback();
    }
  }

  _final(callback) {
    fs.write(this.fileDescriptor, Buffer.concat(this.chunks), (err) => {
      if (err) return callback(err);
      ++this.numberOfWrites;
      this.chunks = [];
      callback(); // callback this is function which pass in stream.on("finish",
    });
  }

  _destroy(error, callback) {
    console.log("Number of writes ", this.numberOfWrites);
    if (this.fileDescriptor) {
      fs.close(this.fileDescriptor, (err) => {
        callback(err || error);
      });
    } else {
      callback(error);
    }
  }
}

// Usage example:
// const stream = new FileWriteStream({
//   hightWaterMark: 1800,
//   fileName: "text.txt",
// });
// stream.write(Buffer.from("This is dome string."));
// stream.end(Buffer.from("Our last write."));

// // stream.on("drain", () => {});
// stream.on("finish", () => {
//     console.log('Stream was finished')
// });


module.exports = { FileWriteStream };

