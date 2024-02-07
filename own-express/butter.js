const http = require("http");
const fs = require("fs/promises");

class Butter {
  constructor() {
    this.server = http.createServer();
    this.routes = {};
    this.middlewares = [];

    this.server.on("request", (req, res) => {
      this._addExtensions(req, res);

      // Middleware order must be: first -> second -> third
      // this.middlewares[0](req, (res) => {
      //   this.middlewares[1](req, (res) => {
      //     this.middlewares[2](req, (res) => {
      //       ...
      //     });
      //   });
      // });

      const runMiddleware = (req, res, index) => {
        if (index === this.middlewares.length) {
          const route = this.routes[`${req.method.toLowerCase()}:${req.url}`];
          if (!route) {
            return res
              .status(404)
              .json({ error: `Cannot ${req.method} ${req.url}` });
          }

          route(req, res);
        } else {
          this.middlewares[index](req, res, () => {
            runMiddleware(req, res, index + 1);
          });
        }
      };

      runMiddleware(req, res, 0);
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

    // this solution good only for JSON which size smaller than hightWaterMarkValue. Better use streams (with .on('drain', () => ))
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

  beforeEach = (cb) => {
    this.middlewares.push(cb);
  };
}

module.exports = Butter;
