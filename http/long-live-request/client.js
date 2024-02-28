const http = require("http");

const request = http.request({
  hostname: "localhost",
  port: 8050,
  path: "/post",
  method: "POST",
  headers: {
    "Content-Type": "application/octet-stream",
    "Transfer-Encoding": "chunked",
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
    console.log("client data: ", chunk.toString());
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
 * Don't specify content-length in request and set chuck size in HEX before data. Chuck looks like:
 * a
 * {"data":1}
 * 
 * a
 * {"data":2}
 * 
 * c
 * {"data":110}
 */
let dataCount = 0;
let interval = setInterval(() => {
  if (dataCount <= 500) {
    let dataString = JSON.stringify({ data: dataCount });
    let chunk = `${Buffer.byteLength(dataString, "utf8").toString(
      16
    )}\r\n${dataString}\r\n`;
    request.write(chunk);
    dataCount++;
  } else {
    clearInterval(interval);
    request.end("0\r\n\r\n"); // Signal the end of transmission
  }
}, 1000);
