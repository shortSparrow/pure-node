// Client
const net = require("net");

const socket = net.createConnection(
  {
    host: "127.0.0.1",
    port: 3099,
  },
  () => {
    const buff = Buffer.alloc(40824)
    socket.write(buff);
  }
);


