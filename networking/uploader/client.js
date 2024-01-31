const net = require("net");
const fs = require("fs/promises");
const path = require("path");

const socket = net.createConnection(
  {
    host: "::1",
    port: 5050,
  },
  async () => {
    const filePath = process.argv[2];
    const fileHandle = await fs.open(filePath, "r");
    const fileStream = fileHandle.createReadStream();

    const fileSize = (await fileHandle.stat()).size;
    let uploadedPercentage = 0;
    let uploadedBytes = 0;

    socket.write(
      `------META_DATA_STARTS: ${JSON.stringify({
        fileName: path.basename(filePath), // from ../../../../../Desktop/D3_React.pages make D3_React.pages
      })} :META_DATA_END------`
    );
    fileStream.on("data", (data) => {
      if (!socket.write(data)) {
        fileStream.pause();
      }

      uploadedBytes += data.length;
      const newPercentage = Math.floor((uploadedBytes / fileSize) * 100);

      if (newPercentage % 5 === 0 && newPercentage !== uploadedPercentage) {
        uploadedPercentage = newPercentage;
        console.log(`Uploading... ${newPercentage}%`);
      }
    });

    socket.on("drain", () => {
      fileStream.resume();
    });

    fileStream.on("end", () => {
      console.log("File was uploaded");
      socket.end();
    });
  }
);
