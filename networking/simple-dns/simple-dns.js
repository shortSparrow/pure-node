const dns = require("node:dns/promises");
const { scheduler } = require("node:timers/promises");

const init = async () => {
  const result = await dns.lookup("google.com");
  console.log("result: ", result); // { address: '142.250.203.142', family: 4 }
};

init();

/*
I could run my code on google.com or nay other site. User will sill correct address in browser, but in reality it was absolutely different website
Check my ip (local/private ip: 192.168...), and run server on this is on port 80

Than:
1. sudo nano /etc/hosts
2. Add this "142.250.203.142 google.com"
3. Save file: Control + O => Enter => Control + X

And each time when I will enter in browser 142.250.203.142 or google.com I will see not google, but my server
*/

