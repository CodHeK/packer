let moduleId = 0;
let fileToId = {};
let idToFile = {};

function getFileIdForPath(path) {
  if (fileToId[path] !== undefined) {
    return fileToId[path];
  }

  const newFileId = moduleId++;
  fileToId[path] = newFileId;
  idToFile[newFileId] = path;

  return newFileId;
}

function getPathFromFileId(id) {
  if (idToFile[id] === undefined) {
    throw new Error("Cannot find file id " + id);
  }

  return idToFile[id];
}

function resetState() {
  moduleId = 0;
  fileToId = {};
  idToFile = {};
}

module.exports = { 
    getFileIdForPath,
    getPathFromFileId,
    resetState,
}