const http = require("http");

const server = http.createServer();

// server.headersTimeout = 60000 * 8; // Limit the amount of time the parser will wait to receive the complete HTTP headers.

server.requestTimeout = 60_000 * 8; // ≈ 480 sec

/**
 * To make request live longer we can set:
 *    server.headersTimeout - Limit the amount of time the parser will wait to receive the complete HTTP headers.
 * or
 *    server.requestTimeout - Sets the timeout value in milliseconds for receiving the entire request from the client.
 *
 * I think better use requestTimeout, but imposable to specify this for specific request, we can set only for whole server
 */

server.on("request", (req, res) => {
  console.log("Server request");

  req.on("data", (chunk) => {
    console.log("server body: ", chunk.toString());
    res.write("Receive " + chunk);
  });

  req.on("error", (err) => {
    console.error("Server Error: ", err);
    console.log("END: ", Date.now());
    res.end();
  });

  req.on("pause", () => {
    console.error("Pause");
  });

  req.on("end", () => {
    console.error("End");
  });

  req.on("close", () => {
    console.error("close");
  });
});

server.listen(8050, "localhost", () => {
  console.log("Listen on port 8050");
});
