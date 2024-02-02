const http = require("http");

const server = http.createServer();

server.on("request", (request, response) => {
  console.log("-------- METHOD: --------");
  console.log(request.method);

  console.log("-------- URL: --------");
  console.log(request.url);

  console.log("-------- HEADERS: --------");
  console.log(request.headers);

  /**
 *  Відправимо з client Buffer.alloc() через  fetch методом POST і подивимося що буде у wireshark
    Buffer.alloc(40824) розбився на 2 чанки TCP по 16388 bytes і один HTTP з 8411 і потім три ACK що всі три запити завершилися успішно. on("data") відпрацювала 1 раз
    Якщо відправити Buffer.alloc(440824) то буде значно більше TCP чанків, але все одно закінчиться воно одним HTTP. І в цей раз  on("data")  відпрацює 7 разів 
    65340 -> 65536 -> 65536 -> 65536 -> 65536 -> 65536 -> 47804
 */

  let data = [];
  request.on("data", (chunk) => {
    // console.log("-------- BODY: --------", chunk.length);
    // console.log(chunk);
    // console.log(chunk.toString());
    data.push(JSON.parse(chunk.toString()));
  });

  request.on("end", () => {
    console.log("DATA: ", data);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Post was created" }));
  });
});

server.listen(8050, "127.0.0.1", () => {
  console.log("Server listening on ", server.address());
});
