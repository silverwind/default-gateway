"use strict";

const exec = require("child_process").exec;
const ipRegex = require("ip-regex");

function wmic(proto) {
  return new Promise(function(resolve, reject) {
    let gateway, gwid;
    exec("wmic path Win32_NetworkAdapterConfiguration where IPEnabled=true get DefaultIPGateway,Index /format:table", function(_, gwtable) {
      exec("wmic path Win32_NetworkAdapter get Index,NetConnectionID /format:table", function(_, iftable) {
        gwtable.trim().split("\n").splice(1).some(function(line) {
          const [gw, id] = line.trim().split(/} +/);
          gateway = (ipRegex[proto]().exec((gw || "").trim()) || [])[0];
          if (gateway) {
            gwid = id;
            return true;
          }
        });
        iftable.trim().split("\n").splice(1).some(function(line) {
          const spaceIndex = line.indexOf(" ");
          const id = line.substr(0, spaceIndex).trim();
          const name = line.substr(spaceIndex + 1).trim();
          if (id === gwid) {
            resolve({gateway: gateway, interface: name ? name : null});
            return true;
          }
        });
        reject(new Error("Unable to determine default gateway"));
      });
    });
  });
}

module.exports.v4 = () => wmic("v4");
module.exports.v6 = () => wmic("v6");
