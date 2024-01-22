// 0100 1000 0110 1001 0010 0001

const buff = Buffer.alloc(3)
buff[0] = 0x48
buff[1] = 0x69
buff[2] = 0x21
console.log(buff.toString('utf8')) // Hi!