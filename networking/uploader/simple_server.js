const net = require("net");
const fs = require("fs/promises");

const server = net.createServer(() => {});

server.on("connection", (socket) => {
  console.log("New connection");

  let fileHandler = null;
  let fileStream = null;

  socket.on("data", async (data) => {
    // for sending file ~5Gb requires ~2GB memory of my computer
    // fileStream.write(data);

    const metaDataIndexStart = data.indexOf("------META_DATA_STARTS: "); // length 24
    const metaDataIndexEnd = data.indexOf(" :META_DATA_END------"); // length 21
    if (metaDataIndexStart !== -1 && metaDataIndexEnd !== -1) {
      socket.pause();
      const metaData = JSON.parse(
        data.subarray(metaDataIndexStart + 24, metaDataIndexEnd)
      );
      fileHandler = await fs.open(`./storage/${metaData.fileName}`, "w");
      fileStream = fileHandler.createWriteStream();
      socket.resume();

      fileStream.on("drain", () => {
        socket.resume();
      });

      const fileItself = Buffer.concat([
        Buffer.from(data.buffer.slice(0, metaDataIndexStart)),
        Buffer.from(data.buffer.slice(metaDataIndexEnd + 21)),
      ]);

      if (!fileStream.write(fileItself)) {
        socket.pause();
      }
    } else {
      if (!fileStream.write(data)) {
        socket.pause();
      }
    }
  });

  socket.on("end", () => {
    console.log("Connection close");
    fileStream.close();
    fileHandler = null;
    fileStream = null;
  });
});

server.listen(5050, "::1", () => {
  console.log("Uploader server opened on ", server.address());
});
