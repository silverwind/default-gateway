"use strict";

const {platform, type} = require("os");

const plat = platform();

if (["aix", "android", "darwin", "freebsd", "linux", "openbsd", "sunos", "win32"].includes(plat)) {
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
  const unsupported = () => {throw new Error(`Unsupported Platform: ${plat}`)};
  module.exports.v4 = unsupported;
  module.exports.v6 = unsupported;
  module.exports.v4.sync = unsupported;
  module.exports.v6.sync = unsupported;
}
