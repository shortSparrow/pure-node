const http = require("http");

const request = http.request({
  hostname: "localhost",
  port: 8050,
  path: "/post",
  method: "POST",
  headers: {
    "Content-Type": "text/plain",
  },
});

request.on("abort", () => {
  console.log("client request abort");
});
request.on("close", () => {
  console.log("client request close");
});
request.on("error", (error) => {
  console.log("client request abort");
});
request.on("connect", () => {
  console.log("client request connect");
});
request.on("drain", () => {
  console.log("client request drain");
});
request.on("finish", () => {
  console.log("client request finish");
});
request.on("information", () => {
  console.log("client request information");
});
request.on("timeout", () => {
  console.log("client request timeout");
});
request.on("socket", () => {
  console.log("client request socket");
});

request.on("response", (response) => {
  console.log("Client response");

  response.on("data", (chunk) => {
    console.log("client data");
    console.log(chunk.toString());
  });

  response.on("end", () => {
    console.log("Client: end");
  });

  response.on("close", () => {
    console.log("Client: close");
  });

  response.on("pause", () => {
    console.log("Client: pause");
  });

  response.on("resume", () => {
    console.log("Client: resume");
  });

  response.on("error", (error) => {
    console.log("Client: error: ", error);
    console.log("Client: error date: ", Date.now());
  });
});


/**
 * Looks pretty similar to client.js. Difference only with "Content-Type": "text/plain" and we specify content length manually
 * Here in wireshark we have different structure POST /post HTTP/1.1  request after ACK. In client.js we have ACK and PSH ACK (ACK - acknowledge data from server, and PSH ACK push new data to server)
 * 
 */

let dataCount = 0;
let interval = setInterval(() => {
  if (dataCount <= 500) {
    request.write(dataCount.toString());
    dataCount++;
  } else {
    clearInterval(interval);
    request.end();
  }
}, 1000);
