const net = require("net");
const fs = require("fs/promises");

const server = net.createServer(() => {});

// * This variables must be inside "on connection" but for demo this is ok
let fileHandler = null;
let fileStream = null;
let isMetadataParsed = false;

const parseData = (_data) => {
  if (isMetadataParsed) {
    return {
      metaData: null,
      file: _data,
    };
  }

  const metaDataIndexStart = _data.indexOf("------META_DATA_STARTS: "); // length 24
  const metaDataIndexEnd = _data.indexOf(" :META_DATA_END------"); // length 21
  if (metaDataIndexStart !== -1 && metaDataIndexEnd !== -1) {
    isMetadataParsed = true;
    const metaData = _data.subarray(metaDataIndexStart + 24, metaDataIndexEnd);

    const fileItself = Buffer.concat([
      Buffer.from(_data.buffer.slice(0, metaDataIndexStart)),
      Buffer.from(_data.buffer.slice(metaDataIndexEnd + 21)),
    ]);

    return {
      metaData: JSON.parse(metaData),
      file: fileItself,
    };
  }

  return {
    metaData: { fileName: "unknown_file_" + Date.now() }, // default name if client not pass fileName
    file: _data,
  };
};

const createFileStream = async (fileName) => {
  fileHandler = await fs.open(`./storage/${fileName}`, "w");
  fileStream = fileHandler.createWriteStream();
};

const closeFileStream = () => {
  fileHandler.close();
  fileHandler = null;
  fileStream = null;
  isMetadataParsed = false;
};

server.on("connection", async (socket) => {
  console.log("New connection");
  socket.on("data", async (data) => {
    // for sending file ~5Gb requires ~2GB memory of my computer
    // fileStream.write(data);

    const { metaData, file } = parseData(data);

    // calls once when metadata comes, on other chunk will be null
    if (metaData) {
      socket.pause(); // without this "second on data" may occurs until createFileStream finished and we have a bug
      await createFileStream(metaData.fileName);
      socket.resume();
      fileStream.on("drain", () => {
        socket.resume();
      });
    }
    if (!fileStream.write(file)) {
      socket.pause();
    }
  });

  socket.on("end", () => {
    console.log("Connection close");
    closeFileStream();
  });
});

server.listen(5050, "::1", () => {
  console.log("Uploader server opened on ", server.address());
});
