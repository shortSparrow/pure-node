const dgram = require("dgram");

const sender = dgram.createSocket("udp4");

sender.send("This is a string", 8000, "127.0.0.1", (error, bytes) => {
  if (error) console.log("Error: ", error);

  console.log("bytes: ", bytes);
});
