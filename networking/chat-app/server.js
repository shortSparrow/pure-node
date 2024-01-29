const net = require("net");

const server = net.createServer();

const clients = [];

server.on("connection", (socket) => {
  const clientId = Date.now().toString();
  socket.write(`id-${clientId}`);

  // Broadcasting message to everyone (except the new user, because   socket.on("data",..) below) when somebody enter
  clients.map((client) => {
    client.socket.write(`User ${clientId} joined`);
  });

  console.log("A new connection to the sever");
  socket.on("data", (data) => {
    // socket.write(data) // send back message to the client
    const dataString = data.toString();
    const id = dataString.slice(0, dataString.indexOf(":"));
    const message = dataString.slice(dataString.indexOf(":") + 1);

    clients.map((clientItem) => {
      clientItem.socket.write(`> User ${id}:${message}`);
    });
  });

  // Broadcasting message to everyone when somebody leaves
  socket.on('end', () => {
    clients.map((client) => {
      client.socket.write(`User ${clientId} left`);
    });
  })

  clients.push({ id: clientId, socket });
});

server.listen(3008, "127.0.0.1", () => {
  console.log("opened server on ", server.address());
});
