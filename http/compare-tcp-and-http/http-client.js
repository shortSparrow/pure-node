const http = require("http");

const agent = new http.Agent({ keepAlive: true });

const request = http.request({
  agent,
  hostname: "localhost",
  port: 8050,
  method: "POST",
  path: "/create-post",
  headers: {
    "Content-Type": "application/json",
    // "content-length": 15 // Я замість 4-ьох повідомлень отримаю тільки неповне перше - {"message":"Hi". Тобто через мержу передадуться всі дані, але на сервері нам будуть доступні тільки перші 15 байт
  },
});

// Почитати про keepAlive і спробувати перевірити у wireShark чи будуть нові handshake
// This event is emitted only once
request.on("response", (response) => {
  console.log("-------- CLIENT RESPONSE HEADER: --------");
  console.log(response.headers);

  console.log("-------- CLIENT RESPONSE STATUS: --------");
  console.log(response.statusCode);

  response.on("data", (chunk) => {
    console.log("-------- CLIENT RESPONSE DATA: --------");
    console.log(chunk.toString());
  });

  response.on("end", () => {
    console.log("Client: no more data");
  });
});

request.write(JSON.stringify({ message: "Hi" }));
request.write(JSON.stringify({ message: "How are you doing?" }));
request.write(JSON.stringify({ message: "Do you still here?" }));

request.end(JSON.stringify({ message: "This is my last message" }));
