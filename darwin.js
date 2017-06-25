"use strict";

const net = require("net");
const exec = require("child_process").exec;
const dests = ["default", "0.0.0.0", "0.0.0.0/0", "::", "::/0"];

const get = (cmd, family) => {
  return new Promise(function(resolve, reject) {
    exec(cmd, function(err, stdout) {
      if (err) return reject(err);
      (stdout || "").trim().split("\n").some(line => {
        let target, gateway, _flags, _ref, _use, iface;
        if (family === "v4") {
          [target, gateway, _flags, _ref, _use, iface] = line.split(/ +/)  || [];
        } else {
          [target, gateway, _flags, iface] = line.split(/ +/)  || [];
        }
        if (dests.includes(target) && gateway && net.isIP(gateway)) {
          resolve({gateway: gateway, interface: (iface ? iface : null)});
          return true;
        }
      });
      reject(new Error("Unable to determine default gateway"));
    });
  });
};

module.exports.v4 = () => get("netstat -rn -f inet", "v4");
module.exports.v6 = () => get("netstat -rn -f inet6", "v6");
