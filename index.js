"use strict";

const platform = require("os").platform();

if (platform === "linux") {
  module.exports.v4 = () => require("./unix")("netstat -rn -A inet | awk '{print $1,$2,$8;}'");
  module.exports.v6 = () => require("./unix")("netstat -rn -A inet6 | awk '{print $1,$2,$7;}'");
} else if (platform === "darwin") {
  module.exports.v4 = () => require("./unix")("netstat -rn -f inet | awk '{print $1,$2,$6;}'");
  module.exports.v6 = () => require("./unix")("netstat -rn -f inet6 | awk '{print $1,$2,$4;}'");
} else if (platform === "win32") {
  module.exports.v4 = () => require("./win32").v4();
  module.exports.v6 = () => require("./win32").v6();
} else {
  module.exports.v4 = () => {throw new Error("Unsupported Platform: " + platform); };
  module.exports.v6 = () => {throw new Error("Unsupported Platform: " + platform); };
}
