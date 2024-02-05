const http = require("http");

const server = http.createServer();

server.on("request", (request, response) => {
  console.log("-------- METHOD: --------");
  console.log(request.method);

  console.log("-------- URL: --------");
  console.log(request.url);

  console.log("-------- HEADERS: --------");
  console.log(request.headers);

  let data = [];
  request.on("data", (chunk) => {
    console.log("-------- BODY: --------");
    console.log(chunk.toString());
    data.push(JSON.parse(chunk.toString()));
  });

  request.on("end", () => {
    console.log("DATA: ", data);
    response.writeHead(200, {
      "Content-Type": "application/json",
      // "content-length": 30,
    });
    response.end(JSON.stringify({ message: "Post was created" }));
  });
});

server.listen(8050, "127.0.0.1", () => {
  console.log("Server listening on ", server.address());
});
