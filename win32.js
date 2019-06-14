"use strict";

const execa = require("execa");
const ipRegex = require("ip-regex");
const os = require("os");

const gwArgs = "path Win32_NetworkAdapterConfiguration where IPEnabled=true get DefaultIPGateway,Index /format:table".split(" ");
const ifArgs = index => `path Win32_NetworkAdapter where Index=${index} get NetConnectionID,MACAddress /format:table`.split(" ");

const spawnOpts = {
  windowsHide: true,
};

function parseGwTable(gwTable, family) {
  for (const line of (gwTable || "").trim().split("\n").splice(1)) {
    const [gw, id] = line.trim().split(/} +/) || [];
    const gateway = (ipRegex[family]().exec((gw || "").trim()) || [])[0];
    if (gateway) return [gateway, id];
  }
}

function parseIfTable(ifTable) {
  const line = (ifTable || "").trim().split("\n")[1];

  let [mac, name] = line.trim().split(/\s+/);
  mac = mac.toLowerCase();

  // try to get the interface name by matching the mac to os.networkInterfaces to avoid wmic's encoding issues
  // https://github.com/silverwind/default-gateway/issues/14
  for (const [osname, addrs] of Object.entries(os.networkInterfaces())) {
    for (const addr of addrs) {
      if (addr && addr.mac === mac) {
        return osname;
      }
    }
  }
  return name;
}

const promise = async family => {
  const gwTable = await execa.stdout("wmic", gwArgs, spawnOpts);
  const [gateway, id] = parseGwTable(gwTable, family) || [];

  if (!gateway) {
    throw new Error("Unable to determine default gateway");
  }

  let name;
  if (id) {
    const ifTable = await execa.stdout("wmic", ifArgs(id), spawnOpts);
    name = parseIfTable(ifTable);
  }

  return {gateway, interface: name ? name : null};
};

const sync = family => {
  const gwTable = execa.sync("wmic", gwArgs, spawnOpts).stdout;
  const [gateway, id] = parseGwTable(gwTable, family) || [];

  if (!gateway) {
    throw new Error("Unable to determine default gateway");
  }

  let name;
  if (id) {
    const ifTable = execa.sync("wmic", ifArgs(id), spawnOpts).stdout;
    name = parseIfTable(ifTable);
  }

  return {gateway, interface: name ? name : null};
};

module.exports.v4 = () => promise("v4");
module.exports.v6 = () => promise("v6");

module.exports.v4.sync = () => sync("v4");
module.exports.v6.sync = () => sync("v6");
