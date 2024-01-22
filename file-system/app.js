const fs = require("fs/promises");

const CREATE_FILE = "create file";
const DELETE_FILE = "delete file";
const RENAME_FILE = "rename file";
const ADD_TO_FILE = "add to file";

const init = async () => {
  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    const { size } = await commandFileHandler.stat(); // size is file size in bytes
    const buff = Buffer.alloc(size);
    const offset = 0; // the location at which we want to start filling out buffer
    const length = buff.byteLength; // how many bytes we want to read
    const position = 0; // without reading works wrong, because first time file was read to end and return correct value, but all next times reading will start from the end and return  Buffer with 0's. So we must move caret to 0 position every time after read file
    await commandFileHandler.read(buff, offset, length, position);
    const command = buff.toString("utf-8");

    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }

    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldPath = command.substring(RENAME_FILE.length + 1, _idx);
      const newPath = command.substring(_idx + " to ".length + 1);
      renameFile(oldPath, newPath);
    }

    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" content: ");
      const path = command.substring(ADD_TO_FILE.length + 1, _idx);
      const content = command.substring(_idx + " content: ".length);
      addToFile(path, content);
    }
  });

  const watcher = fs.watch("./command.txt"); // I may watch one file or whole directory "./"

  for await (const event of watcher) {
    console.log(event)
    if (event.eventType === "change" && event.filename === "command.txt") {
      commandFileHandler.emit("change"); // ! may calls twice (this is known issue and not a bug. I suppose in prod better use separate lib instead of node:watch)
    }
  }

  commandFileHandler.close();
};

const createFile = async (filePath) => {
  try {
    const existingFileHandler = await fs.open(filePath, "r");
    existingFileHandler.close();
    return console.log(`Ths file ${filePath} already exist`);
  } catch (e) {
    // we don't have file, and we should create one
    const newFileHandler = await fs.open(filePath, "w");
    console.log(`Ths file ${filePath} was created`);
    newFileHandler.close();
  }
};

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return console.log(`Ths file ${filePath} was deleted`);
  } catch (e) {
    if (e.code === "ENOENT") {
      console.error(
        `Can't delete file ${filePath}, because no such file or directory does not exist`
      );
    } else {
      console.error(`Can't delete file ${filePath}, the error: ${e}`);
    }
  }
};

const renameFile = async (oldPath, newPath) => {
  try {
    await fs.rename(oldPath, newPath);
    return console.log(`Ths file ${oldPath} was renamed to ${newPath}`);
  } catch (e) {
    if (e.code === "ENOENT") {
      `Can't rename file ${oldPath}, because no such file or directory does not exist`;
    } else {
      console.error(`Can't rename file ${oldPath}, the error: ${e}`);
    }
  }
};

const addToFile = async (path, content) => {
  try {
    await fs.appendFile(path, content);
    const message =
      content.length > 10 ? content.slice(0, 10) + "..." : content.slice(0, 10);

    return console.log(`\"${message}\" was append to ${path}`);
  } catch (e) {
    if (e.code === "ENOENT") {
      `Can't append content to file ${oldPath}, because no such file or directory does not exist`;
    } else {
      console.error(`Can't append to file ${path} content, the error: ${e}`);
    }
  }
};

init();

// open(32) file descriptor. File descriptor is an unsigned integer used by a process to identify an open file
