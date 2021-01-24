exports.ensureSlash = (config, key) => {
  if (typeof config[key] === "string") {
    config[key] = config[key].replace(/([^/])$/, "$1/");
  }
};

exports.removeSlash = (config, key) => {
  if (typeof config[key] === "string") {
    config[key] = config[key].replace(/\/$/g, "");
  }
};

exports.fixPathPrefix = (config, key) => {
  if (typeof config[key] === "string") {
    config[key] = config[key].replace(/^\.\//, "");
  }
};
exports.isAbsoluteUrl = (url) => {
  // A URL is considered absolute if it begins with "<scheme>://" or "//"
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}
