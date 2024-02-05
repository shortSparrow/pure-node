const http = require("http");
const fs = require("fs/promises");

const server = http.createServer();

server.on("request", async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.setHeader("Content-Type", "text/html");

    const file = await fs.open("./public/index.html", "r");
    const fileStream = file.createReadStream();

    fileStream.pipe(res);
  }

  if (req.method === "GET" && req.url === "/styles.css") {
    res.setHeader("Content-Type", "text/css");

    const file = await fs.open("./public/styles.css", "r");
    const fileStream = file.createReadStream();

    fileStream.pipe(res);
  }

  if (req.method === "GET" && req.url === "/script.js") {
    res.setHeader("Content-Type", "text/javascript");

    const file = await fs.open("./public/script.js", "r");
    const fileStream = file.createReadStream();

    fileStream.pipe(res);
  }

  if (req.method === "POST" && req.url === "/login") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.write(JSON.stringify({ message: "Logging you in..." }));
    res.end(); // Без цього запит буде висіти (але дані відправляться)
  }

  if (req.method === "POST" && req.url === "/upload") {
    const fileHandler = await fs.open("./storage/image.jpg", "w");
    const fileStream = fileHandler.createWriteStream();

    req.pipe(fileStream);

    req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ message: "File uploaded success" }));
    });
  }
});

server.listen(9000, () => {
  console.log("Lister server on ", server.address());
});
