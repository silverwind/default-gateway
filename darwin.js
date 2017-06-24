"use strict";

const net = require("net");
const exec = require("child_process").exec;
const dests = ["default", "0.0.0.0", "0.0.0.0/0", "::", "::/0"];

const get = cmd => {
  return new Promise(function(resolve, reject) {
    exec(cmd, function(err, stdout) {
      if (err) return reject(err);
      (stdout || "").trim().split("\n").some(line => {
        const [target, gateway, iface] = line.split(" ");
        if (dests.includes(target) && gateway && net.isIP(gateway)) {
          resolve({gateway: gateway, interface: (iface ? iface : null)});
          return true;
        }
      });
      reject(new Error("Unable to determine default gateway"));
    });
  });
};

module.exports.v4 = () => get("netstat -rn -f inet | awk '{print $1,$2,$6;}'");
module.exports.v6 = () => get("netstat -rn -f inet6 | awk '{print $1,$2,$4;}'");
