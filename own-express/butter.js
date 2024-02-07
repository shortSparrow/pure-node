const http = require("http");
const fs = require("fs/promises");

class Butter {
  constructor() {
    this.server = http.createServer();
    this.routes = {};

    this.server.on("request", (req, res) => {
      console.log("Request came in");
      this._addExtensions(req, res);

      const route = this.routes[`${req.method.toLowerCase()}:${req.url}`];
      if (!route) {
        return res
          .status(404)
          .json({ error: `Cannot ${req.method} ${req.url}` });
      }

      route(req, res);
    });
  }

  _addExtensions(req, res) {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    res.sendFile = async (path, mime) => {
      const fileHandler = await fs.open(path, "r");
      const fileStream = fileHandler.createReadStream();

      res.setHeader("Content-Type", mime);
      fileStream.pipe(res);
    };

    res.json = (data) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    };
  }

  listen = (port, cb) => {
    this.server.listen(port, cb);
  };

  route = (method, url, cb) => {
    this.routes[`${method.toLowerCase()}:${url}`] = cb;
  };
}

module.exports = Butter;
