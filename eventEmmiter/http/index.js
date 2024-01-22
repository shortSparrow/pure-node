const http = require("http");
// ###### 1
// const req = http.request("http://jsonplaceholder.typicode.com/todos/1", (res) => {
//   res.on("data", (chunk) => {
//     console.log("Chunk: ", chunk.toString()); // return many chunks like <Buffer 3c 21 64 6f 63 74 79 70 65 20 68 74 6d 6c 3e 3c 68 74 6d 6c 20 69 74 65 6d 73 63 6f 70 65 3d 22 22 20 69 74 65 62f ... XXXX more bytes>
//     // chunk is bytes, but we convert them to string
//     // console.log(`Data chunk: ${chunk}`);
//   });

//   res.on("end", () => {
//     console.log("No more data");
//   });
// });

// req.end();

// ###### 2
const server = http.createServer();
server.on("request", (request, response) => {
  // the same kind of magic happens here!
});

http.get(
  {
    hostname: "jsonplaceholder.typicode.com",
    port: 80,
    path: "/todos/1",
    agent: false, // Create a new agent just for this one request
  },
  (res) => {
    console.log(res.statusCode);

    res.on("close", () => {
      console.log("close");
    });
    res.on("data", (data) => {
      console.log("data: ", data.toString());
    });
    res.on("end", () => {
      console.log("end");
    });
    res.on("error", () => {
      console.log("error");
    });
    res.on("pause", () => {
      console.log("pause");
    });
    // res.on("readable", () => {
    //   console.log("readable");
    // });
    res.on("resume", () => {
      console.log("resume");
    });
  }
);

// If "readable" is commented we will receive
// 200
// resume
// data:  {
//   "userId": 1,
//   "id": 1,
//   "title": "delectus aut autem",
//   "completed": false
// }
// end
// close

// If "readable" is un commented we will receive
// 200
// resume
// readable

/*
This difference is because of the way Node.js handles data events from streams, which is what the http response object is.

When any data event listeners like 'readable' or 'data' are attached to the stream, Node.js automatically switches the stream into flowing mode. In flowing mode, data is read from the underlying system and provided to your program as quickly as possible. 

On the other hand, if no data event listeners are attached, the stream is in paused mode. In this mode, you must explicitly read data from the stream using the read() function.

In your case, when you attached the 'readable' and 'resume' listeners to the response object, Node switched the stream into flowing mode, causing it to emit 'resume' and 'readable' events. But since no 'data' event listener was attached, no data was actually read from the stream. This is why you didn't see any 'data' events.

When you removed the 'readable' and 'resume' listeners, Node.js kept the stream in paused mode. In this mode, the http module automatically reads data from the stream for you and emits 'data' events. This is why you saw 'data' events when you removed the 'readable' and 'resume' listeners.
*/
