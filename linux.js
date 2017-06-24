"use strict";

const net = require("net");
const exec = require("child_process").exec;

const get = cmd => {
  return new Promise(function(resolve, reject) {
    exec(cmd, function(_, stdout) {
      (stdout || "").trim().split("\n").some(line => {
        const [_, gatway, iface] = /default via (.+?) dev (.+)(?: |$)/.exec(line);
        if (gateway && net.isIP(gateway)) {
          resolve({gateway: gateway, interface: (iface ? iface : null)});
          return true;
        }
      });
      reject(new Error("Unable to determine default gateway"));
    });
  });
};

module.exports.v4 = () => get("ip -4 r'");
module.exports.v6 = () => get("ip -6 r");
