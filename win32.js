"use strict";

const {isIP} = require("net");
const {networkInterfaces} = require("os");
const execa = require("execa");

const gwArgs = "path Win32_NetworkAdapterConfiguration where IPEnabled=true get DefaultIPGateway,GatewayCostMetric,IPConnectionMetric,Index /format:table".split(" ");
const ifArgs = index => `path Win32_NetworkAdapter where Index=${index} get NetConnectionID,MACAddress /format:table`.split(" ");

const gwArgsPowershell = `-ExecutionPolicy Bypass -Command Get-CimInstance Win32_NetworkAdapterConfiguration -filter IPEnabled=true | Format-Table -property DefaultIPGateway,GatewayCostMetric,Index,IPConnectionMetric`.split(" ");
const ifArgsPowershell = index => `-ExecutionPolicy Bypass -Command Get-CimInstance Win32_NetworkAdapter -filter Index=${index} | Format-Table -property NetConnectionID,MacAddress`.split(" ");

const spawnOpts = {
  windowsHide: true,
};

// Parsing tables like this. The final metric is GatewayCostMetric + IPConnectionMetric
//
// DefaultIPGateway             GatewayCostMetric  Index  IPConnectionMetric
// {"1.2.3.4", "2001:db8::1"}   {0, 256}           12     25
// {"2.3.4.5"}                  {25}               12     55
function parseGwTable(gwTable, family, command) {
  let [bestGw, bestMetric, bestId] = [null, null, null];

  for (let line of (gwTable || "").trim().split(/\r?\n/).splice(1)) {
    line = line.trim();
    const [_, gwArr, gwCostsArr, id, ipMetric] = /({.+?}) +?({.+?}) +?([0-9]+) +?([0-9]+)/g.exec(line) || [];
    if (!gwArr) continue;

    let finalGwArr = gwArr;
    if (command === "powershell") {
      finalGwArr = `{ ${gwArr.replace(/[{}]/g, "").split(", ").map((value) => `"${value}"`).join(", ")} }`;
    }

    const gateways = (finalGwArr.match(/"(.+?)"/g) || []).map(match => match.substring(1, match.length - 1));
    const gatewayCosts = (gwCostsArr.match(/[0-9]+/g) || []);

    for (const [index, gateway] of Object.entries(gateways)) {
      if (!gateway || `v${isIP(gateway)}` !== family) continue;

      const metric = parseInt(gatewayCosts[index]) + parseInt(ipMetric);
      if (!bestGw || metric < bestMetric) {
        [bestGw, bestMetric, bestId] = [gateway, metric, id];
      }
    }
  }

  if (bestGw) return [bestGw, bestId];
}

function parseIfTable(ifTable) {
  const line = (ifTable || "").trim().split("\n")[1];

  let [mac, name] = line.trim().split(/\s+/);
  mac = mac.toLowerCase();

  // try to get the interface name by matching the mac to os.networkInterfaces to avoid wmic's encoding issues
  // https://github.com/silverwind/default-gateway/issues/14
  for (const [osname, addrs] of Object.entries(networkInterfaces())) {
    for (const addr of addrs) {
      if (addr && addr.mac && addr.mac.toLowerCase() === mac) {
        return osname;
      }
    }
  }
  return name;
}

const execCommandSync = () => {
  try {
    const {stdout} = execa.sync("wmic", gwArgs, spawnOpts);
    return {stdout, command: "wmic"};
  } catch {
    const {stdout} = execa.sync("powershell", gwArgsPowershell, spawnOpts);
    return {stdout, command: "powershell"};
  }
};

const execCommandWithIdSync = (id) => {
  try {
    const {stdout} = execa.sync("wmic", ifArgs(id), spawnOpts);
    return {stdout, command: "wmic"};
  } catch {
    const {stdout} = execa.sync("powershell", ifArgsPowershell(id), spawnOpts);
    return {stdout, command: "powershell"};
  }
};

const execCommand = async () => {
  try {
    const {stdout} = await execa("wmic", gwArgs, spawnOpts);
    return {stdout, command: "wmic"};
  } catch {
    const {stdout} = await execa("powershell", gwArgsPowershell, spawnOpts);
    return {stdout, command: "powershell"};
  }
};

const execCommandWithId = async (id) => {
  try {
    const {stdout} = await execa("wmic", ifArgs(id), spawnOpts);
    return {stdout, command: "wmic"};
  } catch {
    const {stdout} = await execa("powershell", ifArgsPowershell(id), spawnOpts);
    return {stdout, command: "powershell"};
  }
};

const promise = async family => {
  const {stdout, command} = await execCommand();
  const [gateway, id] = parseGwTable(stdout, family, command) || [];

  if (!gateway) {
    throw new Error("Unable to determine default gateway");
  }

  let name;
  if (id) {
    const {stdout} = await execCommandWithId(id);
    name = parseIfTable(stdout);
  }

  return {gateway, interface: name ? name : null};
};

const sync = family => {
  const {stdout, command} = execCommandSync();
  const [gateway, id] = parseGwTable(stdout, family, command) || [];

  if (!gateway) {
    throw new Error("Unable to determine default gateway");
  }

  let name;
  if (id) {
    const {stdout} = execCommandWithIdSync(id);
    name = parseIfTable(stdout);
  }

  return {gateway, interface: name ? name : null};
};

module.exports.v4 = () => promise("v4");
module.exports.v6 = () => promise("v6");

module.exports.v4.sync = () => sync("v4");
module.exports.v6.sync = () => sync("v6");
