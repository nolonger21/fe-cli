
exports.dirToGather = (dirPath, nameSplit, gatherKey) => {
  if (!dirPath) return;
  const fs = require("fs");
  const obj = {};
  const gather = {};
  fs.readdirSync(dirPath).forEach((filename) => {
    const fixName = filename.split(nameSplit)[0];
    const targetPath = dirPath + "/" + filename;
    if (targetPath.endsWith('.js')) {
      obj[fixName] = require(targetPath);
      Object.keys(obj[fixName]).forEach((item) => {
        gather[item] = obj[fixName][item];
      });
    }
  });
  if(Object.keys(gather).length) {
    obj.common = gather;
  }
  if (gatherKey) obj[gatherKey] = gather;
  return obj;
};