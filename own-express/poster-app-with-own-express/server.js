const Butter = require("../butter");

const PORT = 8000;
const server = new Butter();

// { userId:1, token: 121314141 }
const SESSIONS = [];

const USERS = [
  { id: 1, name: "Liam Brown", username: "liam23", password: "string" },
  { id: 2, name: "Meredith Green", username: "merit.sky", password: "string" },
  { id: 3, name: "Ben Adams", username: "bet.poet", password: "string" },
];
const POSTS = [
  {
    id: 1,
    title: "This is a post title",
    body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    userId: 1,
  },
];

// Auth check
server.beforeEach((req, res, next) => {
  const routeToAuthenticate = [
    "GET /api/user",
    "PUT /api/user",
    "POST /api/posts",
    "DELETE /api/logout",
  ];

  if (routeToAuthenticate.includes(`${req.method} ${req.url}`)) {
    if (!req.headers.cookie)
      return res.status(401).json({ error: "Unauthorized" });

    const token = req.headers.cookie.split("=")[1];
    const session = SESSIONS.find((session) => session.token === token);

    if (session) {
      req.userId = session.userId;
      return next();
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    return next();
  }
});

// Fot different routes that need the index.html
server.beforeEach((req, res, next) => {
  const routes = ["/", "/login", "/profile", "/new-post"];

  if (routes.includes(req.url) && req.method === "GET") {
    return res.status(200).sendFile("./public/index.html", "text/html");
  }

  return next();
});

// Parsing JSON body
server.beforeEach((req, res, next) => {
  // this solution good only for JSON which size smaller than hightWaterMarkValue. Maybe better use streams (with .on('drain', () => )
  if (req.headers["content-type"] === "application/json") {
    let bodyString = "";
    req.on("data", (chunk) => {
      bodyString += chunk.toString();
    });

    req.on("end", () => {
      req.body = JSON.parse(bodyString);
      next();
    });
  } else {
    return next();
  }
});

// ------ FILE ROUTES ------ //

server.route("get", "/", (req, res) => {
  res.sendFile("./public/index.html", "text/html");
});

server.route("get", "/login", (req, res) => {
  res.sendFile("./public/index.html", "text/html");
});

server.route("get", "/styles.css", (req, res) => {
  res.sendFile("./public/styles.css", "text/css");
});

server.route("get", "/scripts.js", (req, res) => {
  res.sendFile("./public/scripts.js", "text/javascript");
});

// ------ JSON ROUTES ------ //

server.route("post", "/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = USERS.find((user) => user.username === username);
  if (user && user.password === password) {
    const token = String(Math.floor(Math.random() * 1000000000));
    SESSIONS.push({ userId: user.id, token: token });

    res.setHeader("Set-Cookie", `token=${token}; Path=/;`);
    res.status(200).json({ message: "You logged successfully" });
  } else {
    res.status(401).json({ message: "Login or password invalid" });
  }
});
server.route("delete", "/api/logout", (req, res) => {
  const sessionIndex = SESSIONS.findIndex((item) => item.userId === req.userId);
  if (sessionIndex !== -1) {
    SESSIONS.splice(sessionIndex, 1); // remove session from session list
  }

  res.setHeader("Set-Cookie", `token=deleted; Path=/; expires=${new Date(1)}`);
  res.status(200).json({ message: "Logged out successfully" });
});

server.route("post", "/api/user", (req, res) => {});
server.route("put", "/api/user", (req, res) => {
  const { username, name, password } = req.body;

  const user = USERS.find((user) => user.id === req.userId);

  user.username = username;
  user.name = name;

  if (password.length > 0) {
    user.password = password;
  }

  return res.status(200).json({
    username: user.username,
    name: user.name,
    password_status: password.length > 0 ? "updated" : "not updated",
  });
});
server.route("get", "/api/user", (req, res) => {
  const token = req.headers.cookie.split("=")[1];
  const session = SESSIONS.find((session) => session.token === token);

  if (session) {
    const user = USERS.find((user) => user.id === session.userId);
    res.json({ username: user.username, name: user.name });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

server.route("get", "/api/posts", (req, res) => {
  const post = POSTS.map((post) => {
    const user = USERS.find((user) => user.id === post.userId);
    post.author = user.name;
    return post;
  });
  res.status(200).json(POSTS);
});
server.route("post", "/api/posts", (req, res) => {
  const { title, body } = req.body;

  const post = {
    id: Date.now(),
    title,
    body,
    userId: req.userId,
  };

  POSTS.unshift(post);
  res.status(201).json(post);
});

server.listen(PORT, () => {
  console.log("Server listen on port ", PORT);
});
