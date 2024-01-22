// const {Writable, Readable} = require('node:stream')
// ! Unfortunately JS don't support multiple inheritance
// class customDuplexStream extends Writable, Readable {}

// Duplex stream has Readable Internal Buffer, and Writable Internal Buffer

const { Duplex } = require("node:stream");
const fs = require("node:fs");

// _construct, _write, _read, _final I take from custom-readable-stream/custom-writable-stream and replace fileDescriptor
class CustomDuplexStream extends Duplex {
  constructor({
    writableHighWaterMark,
    writableFileName,
    readableHighWaterMark,
    readableFileName,
  }) {
    super({ readableHighWaterMark, writableHighWaterMark });

    this.readableFileName = readableFileName;
    this.readableFileDescriptor = null;

    this.writableFileName = writableFileName;
    this.writableFileDescriptor = null;

    this.chunks = [];
    this.chunksSize = 0;
  }

  _construct(callback) {
    fs.open(this.readableFileName, "r", (err, readFd) => {
      if (err) return callback(err);

      this.readableFileDescriptor = readFd;

      fs.open(this.writableFileName, "w", (err, writeFd) => {
        if (err) return callback(err);
        this.writableFileDescriptor = writeFd;
        callback();
      });
    });
  }

  _write(chunk, encoding, callback) {
    // do our operation....
    // console.log(this.fileDescriptor); // comment because this make code very slower (230.855ms vs 4s)
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;
    if (this.chunksSize > this.writableHighWaterMark) {
      fs.write(
        this.writableFileDescriptor,
        Buffer.concat(this.chunks),
        (err) => {
          if (err) {
            return callback(err);
          }
          this.chunks = [];
          this.chunksSize = 0;
          callback();
        }
      );
    } else {
      callback();
    }
  }

  _read(size) {
    const buffer = Buffer.alloc(size);
    fs.read(
      this.readableFileDescriptor,
      buffer,
      0,
      size,
      null,
      (err, bytesRead) => {
        if (err) return this.destroy(err);

        // push(null) is to indicate to end of the stream
        this.push(bytesRead > 0 ? buffer.subarray(0, bytesRead) : null); // subarray needed for avoiding reading empty characters. Buffer size may be 1000, but bytesRead only 30. In this case we push only 30 characters, and filter empty useless characters
      }
    );
  }

  _final(callback) {
    fs.write(this.writableFileDescriptor, Buffer.concat(this.chunks), (err) => {
      if (err) return callback(err);

      this.chunks = [];
      callback(); // callback this is function which pass in stream.on("finish",
    });
  }

  // simple version. You could close file of course here
  _destroy(error, callback) {
    callback(error);
  }
}

const duplex = new CustomDuplexStream({
  readableFileName: "text.txt",
  writableFileName: "dest.txt",
});

duplex.write(Buffer.from("Thi is a string 0\n"));
duplex.write(Buffer.from("Thi is a string 1\n"));
duplex.write(Buffer.from("Thi is a string 2\n"));
duplex.write(Buffer.from("Thi is a string 3\n"));
duplex.write(Buffer.from("Thi is a string 4\n"));
duplex.end(Buffer.from("End of write"));

duplex.on("data", (chunk) => {
  console.log(chunk); // <Buffer 48 65 6c 6c 6f 20 74 68 65 72 65> Data from text.txt
});
