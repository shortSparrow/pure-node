// Server
const net = require("net");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log(data);
  });
});

server.listen(3099, "127.0.0.1", () => {
  console.log("opened server on: ", server.address()); // { address: '127.0.0.1', family: 'IPv4', port: 3099 }
});


// server.listen(3099, "::1", () => {
//   console.log("opened server on: ", server.address()); // { address: '::1', family: 'IPv6', port: 3099 }
// });


// By default node use IPv6
// server.listen(3099, () => {
//   console.log("opened server on: ", server.address());  // { address: '::', family: 'IPv6', port: 3099 }
// });

