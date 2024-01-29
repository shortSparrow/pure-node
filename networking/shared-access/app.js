const http = require("http");

const port = 4080;
const hostname = "localhost";

const server = http.createServer((req, res) => {
  const data = { message: "Hi there!" };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Connection", "close");
  res.statusCode = 200;
  res.end(JSON.stringify(data));
});

server.listen(port,  () => {
  console.log(`Server running at http://${hostname}:${port}`);
});

// підключаю комп і мобілку до одного wifi, далі вводжу ifconfig в терміналі і беру ip який в en0 - 192.168.0.104
// Вставляю 192.168.0.104:4080 в телефоні і отримаю відповідь - {"message":"Hi there!"}


/*
Або я можу роздати інтернет з телефона, далі на компі підключитися до нього, подивитися в налаштуваннях wifi його ip Address - 192.168.43.234 і запустити сервер на ньому 192.168.43.234:4080. Тоді використовуючи цю адресу зможу як підключитися з компа так і з телефона
*/