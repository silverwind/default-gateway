"use strict";

const net = require("net");
const execa = require("execa");
const dests = ["default", "0.0.0.0", "0.0.0.0/0", "::", "::/0"];

const args = {
  v4: ["-rn", "-f", "inet"],
  v6: ["-rn", "-f", "inet6"],
};

const get = family => {
  return execa.stdout("netstat", args[family]).then(stdout => {
    let result;

    (stdout || "").trim().split("\n").some(line => {
      let target, gateway, _flags, _ref, _use, iface;
      if (family === "v4") {
        [target, gateway, _flags, _ref, _use, iface] = line.split(/ +/) || [];
      } else {
        [target, gateway, _flags, iface] = line.split(/ +/) || [];
      }
      if (dests.includes(target) && gateway && net.isIP(gateway)) {
        result = {gateway: gateway, interface: (iface ? iface : null)};
        return true;
      }
    });

    if (!result) {
      throw new Error("Unable to determine default gateway");
    }

    return result;
  });
};

module.exports.v4 = () => get("v4");
module.exports.v6 = () => get("v6");
