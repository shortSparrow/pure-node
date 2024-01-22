// ###### 1
// const EventEmitter = require('node:events');
// class MyEmitter extends EventEmitter {}
// const myEmitter = new MyEmitter();
// myEmitter.on('error', (err) => {
//     console.log('Error: ', err)
// })
// myEmitter.emit('error', new Error('whoops!'));


// ###### 2
// const EventEmitter = require("node:events");
// class MyEmitter extends EventEmitter {}

// const myEmitter = new MyEmitter();

// myEmitter.once("newListener", (event, listener) => {
//   console.log("1: ");
//   if (event === "event") {
//     // Insert a new listener in front
//     myEmitter.on("event", () => {
//       console.log("B");
//     });
//   }
// });

// myEmitter.on("event", () => {
//   console.log("A");
// });
// console.log(myEmitter.listeners("event"));

// myEmitter.emit("event");

// ###### 3
const EventEmitter = require("./events/eventEmitter");
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on("event", () => {
  console.log("A");
});
myEmitter.on("event", () => {
  console.log("B");
});
console.log(myEmitter.rawListeners("event"));

myEmitter.emit("event");
