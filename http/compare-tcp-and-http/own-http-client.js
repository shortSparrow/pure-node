// ############ 1
// const net = require("net");

// const socket = net.createConnection(
//   {
//     host: "localhost",
//     port: 8050,
//   },
//   () => {
//     socket.write(Buffer.from("Hi"));
//   }
// );

// socket.on("data", (chunk) => {
//   console.log("NET-SENDER DATA: ", chunk.toString("utf-8")); // HTTP/1.1 400 Bad Request

//   socket.end();
// });

// socket.on("end", () => {
//   console.log("connection closed");
// });

//  Ми отримали Bad Request тому що сервер очікую http (бо ми зробили саме http server), а ми надсилаємо TCP








// ############ 2
/*
    Тепер додамо до нашого TCP те що буде ідентифікувати наш запит як HTTP. Для цього робимо будь-який http запит і дивимося на нього у wireshark
    Знаходимо Hypertext Transfer Protocol секцію і копіюємо її (Copy Bytes as HEX + ASCII dump)

    0000   50 4f 53 54 20 2f 63 72 65 61 74 65 2d 70 6f 73   POST /create-pos
    0010   74 20 48 54 54 50 2f 31 2e 31 0d 0a 43 6f 6e 74   t HTTP/1.1..Cont
    0020   65 6e 74 2d 54 79 70 65 3a 20 61 70 70 6c 69 63   ent-Type: applic
    0030   61 74 69 6f 6e 2f 6a 73 6f 6e 0d 0a 48 6f 73 74   ation/json..Host
    0040   3a 20 6c 6f 63 61 6c 68 6f 73 74 3a 38 30 35 30   : localhost:8050
    0050   0d 0a 43 6f 6e 6e 65 63 74 69 6f 6e 3a 20 6b 65   ..Connection: ke
    0060   65 70 2d 61 6c 69 76 65 0d 0a 43 6f 6e 74 65 6e   ep-alive..Conten
    0070   74 2d 4c 65 6e 67 74 68 3a 20 31 36 0d 0a 0d 0a   t-Length: 16....


    0d 0a -> .. Тобто це знак розділення хедерів і headline (по суті це знак дає нам абзац - це спеціальні символи \r\n)
    0d 0a 0d 0a -> .... Це знак того що хедери і headline закінчилися

    Це гарно для читання, але нам треба прибрати пробіли, тож скопіюємо як (...as a HEX Stream).
    504f5354202f6372656174652d706f737420485454502f312e310d0a436f6e74656e742d547970653a206170706c69636174696f6e2f6a736f6e0d0a486f73743a206c6f63616c686f73743a383035300d0a436f6e6e656374696f6e3a206b6565702d616c6976650d0a436f6e74656e742d4c656e6774683a2031360d0a0d0a

    І перетворимо це у текст:
    POST /create-post HTTP/1.1
    Content-Type: application/json
    Host: localhost:8050
    Connection: keep-alive
    Content-Length: 16

    Важливо пам'ятати що при перетворенні HEX в Text у нас втрачаються \r\n (перетворював онлайн тут https://www.rapidtables.com/convert/number/ascii-to-hex.html). Тобто абзаци є, але якщо я перетворю hex що закінчується 0d0a0d0a в text, а потім це перетворю назад в hex то у мене буде 0a0a

*/

const net = require("net");

const socket = net.createConnection(
  {
    host: "localhost",
    port: 8050,
  },
  () => {
    const head = Buffer.from(
      "504f5354202f6372656174652d706f737420485454502f312e310d0a436f6e74656e742d547970653a206170706c69636174696f6e2f6a736f6e0d0a486f73743a206c6f63616c686f73743a383035300d0a436f6e6e656374696f6e3a206b6565702d616c6976650d0a436f6e74656e742d4c656e6774683a2031360d0a0d0a",
      "hex"
    );
    const body = Buffer.from(JSON.stringify({ message: "Hi" }));

    // const body = Buffer.from(JSON.stringify({ message: "Hi all" })); // ! оскільки зараз в head вказано Content-Length: 16, якщо я надішлю "Hi all" я отримаю краш SyntaxError: Expected ',' or '}' after property value in JSON at position 16
    // Content-Length: 16 - 0d0a436f6e74656e742d4c656e6774683a203136


    socket.write(Buffer.concat([head, body]));

    // Також можна використати не HEX, a UTF-8
    // const headWithMessage =
    //   "POST / HTTP/1.1\r\n" +
    //   "Host: localhost:8080\r\n" +
    //   "Content-Length: 16\r\n\r\n" +
    //   JSON.stringify({ message: "Hi" });
    // socket.write(Buffer.from(headWithMessage));
  }
);

socket.on("data", (chunk) => {
  console.log("NET-SENDER DATA: ", chunk.toString("utf-8")); // Тепер запит валідний
  /*
        HTTP/1.1 200 OK
        Content-Type: application/json
        Date: Fri, 02 Feb 2024 14:31:24 GMT
        Connection: keep-alive
        Keep-Alive: timeout=5
        Transfer-Encoding: chunked

        1e
        {"message":"Post was created"}
        0
    */

  /**
   * Стосовно дивних цифр перед і після body - 1e i 0
   * Числі  1e i 0 пов'язані з "фрагментарним" кодуванням HTTP-відповіді. У HTTP/1.1, коли або розмір відповіді невідомий на момент відповіді, або для того,
   * щоб зберегти з'єднання відкритим для наступних запитів, сервер може кодувати відповідь частинами.
   *
   * Кожен фрагмент починається з кількості октетів фрагмента, вираженої шістнадцятковим числом, за яким слідує \r\n, потім сам фрагмент і ще один \r\n.
   * Після того, як всі фрагменти надіслано, надсилається нуль, за яким слідує роздільник частин фрагмента.
   *
   * У цьому випадку 1e є шістнадцятковим представленням десяткового числа 30, яке дорівнює довжині вашого JSON-повідомлення
   * (включаючи дужки, лапки, ключі, значення і двокрапку). Кінцевий 0 вказує на кінець фрагментів.
   * 
   * Якщо сервер додасть хедер "content-length" то ці цифри зникнуть
   */

  socket.end();
});

socket.on("end", () => {
  console.log("connection closed");
});

// Виглядає так що HTTP це просто узгодження формату передачі даних, він не робить нічого окрім як визначає форму/структуру повідомлення