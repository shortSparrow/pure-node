const http = require("http");

const server = http.createServer();

/**
 *  In Chrome open / and go to Cached link:
 *  - First time wait 2 second and render html response
 *  - Second and next times open imdeitatly and in "size" column text "disck cache"
 *
 *  Pay attention that if you try past /cached in browser or just reload page cache will ot work, because
 *  most browsers by default request new data in this ceases (they think about this like navigation but not getting data)
 *
 */

const sleep = (time) =>
  new Promise((resolve, reject) => setTimeout(() => resolve(), time));

server.on("request", async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "private, max-age=3600"); // cache for 1 hour

    res.end(
      `<html><body><a href="/cached">Go to cached page</a></body></html>`
    );
  }

  if (req.method === "GET" && req.url === "/cached") {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "private, max-age=3600"); // cache for 1 hour

    await sleep(2000);
    res.end("<html><body><p>Cached!</p></body></html>");
  }
});

server.listen(8000, "localhost", () => {
  console.log("Listen on:", server.address());
});
