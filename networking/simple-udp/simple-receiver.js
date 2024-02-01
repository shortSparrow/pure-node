const dgram = require("dgram");

const receiver = dgram.createSocket("udp4");

receiver.on("message", (message, remoteInfo) => {
  console.log("message: ", message.toString());
  console.log("remoteInfo: ", remoteInfo); // { address: '127.0.0.1', family: 'IPv4', port: 60862, size: 16 }
});

receiver.bind({ address: "127.0.0.1", port: 8000 });

receiver.on("listening", () => {
  console.log("Server listening on: ", receiver.address());
});
