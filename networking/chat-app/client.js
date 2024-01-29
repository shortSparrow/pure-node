const net = require("net");
const readline = require("readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clearLine = async (dir) => {
  return new Promise((resolve, reject) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
};

const moveCursor = async (dx, dy) => {
  return new Promise((resolve, reject) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};

const ask = async () => {
  const message = await rl.question("Enter a message > ");
  await moveCursor(0, -1); // move cursor one line up
  await clearLine(0);
  client.write(`${id}: ${message}`);
};

let id = null;

const client = net.createConnection(
  {
    host: "127.0.0.1",
    port: 3008,
  },
  async () => {
    console.log("Connected to the server");
    ask();
  }
);

client.on("data", async (data) => {
  // needed for second client's terminal
  console.log();
  await moveCursor(0, -1);
  await clearLine(0);

  if (data.toString().slice(0, 2) === "id") {
    // when we receive id
    id = data.toString().slice(3);
    console.log(`Your id is ${id} \n`);
  } else {
    // when we receive message
    console.log(data.toString());
  }

  ask();
});

client.on("end", () => {
  console.log("Client connection ended");
});
