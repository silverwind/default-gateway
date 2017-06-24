"use strict";

const net = require("net");
const exec = require("child_process").exec;
const dests = ["default", "0.0.0.0", "0.0.0.0/0", "::", "::/0"];

module.exports = cmd => {
  return new Promise(function(resolve, reject) {
    exec(cmd, function(_, stdout) {
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
