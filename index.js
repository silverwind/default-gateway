"use strict";

const platform = require("os").platform();

if ([
  "android",
  "darwin",
  "freebsd",
  "linux",
  "openbsd",
  "sunos",
  "win32"
].indexOf(platform) !== -1) {
  const fams = require(`./${platform}`);

  module.exports.v4 = () => fams.v4();
  module.exports.v6 = () => fams.v6();
  module.exports.v4.sync = () => fams.v4.sync();
  module.exports.v6.sync = () => fams.v6.sync();
} else {
  const noop = () => { throw new Error(`Unsupported Platform: ${platform}`); };
  module.exports.v4 = noop;
  module.exports.v6 = noop;
  module.exports.v4.sync = noop;
  module.exports.v6.sync = noop;
}
