"use strict";

const {platform, type} = require("os");

const supportedPlatforms = new Set([
  "aix",
  "android",
  "darwin",
  "freebsd",
  "linux",
  "openbsd",
  "sunos",
  "win32"
]);

const plat = platform();

if (supportedPlatforms.has(plat)) {
  let file;
  if (plat === "aix") {
    // AIX `netstat` output is compatible with Solaris
    file = `${type() === "OS400" ? "ibmi" : "sunos"}.js`;
  } else {
    file = `${plat}.js`;
  }

  const m = require(`./${file}`);
  module.exports.v4 = () => m.v4();
  module.exports.v6 = () => m.v6();
  module.exports.v4.sync = () => m.v4.sync();
  module.exports.v6.sync = () => m.v6.sync();
} else {
  const err = new Error(`Unsupported Platform: ${plat}`);
  module.exports.v4 = () => Promise.reject(err);
  module.exports.v6 = () => Promise.reject(err);
  module.exports.v4.sync = () => {throw err; };
  module.exports.v6.sync = () => {throw err; };
}
