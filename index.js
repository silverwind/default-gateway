import {isIP} from "node:net";
import {execa, execaSync} from "execa";
import {platform, type, release, networkInterfaces} from "node:os";

const plat = platform();
const dests = new Set(["default", "0.0.0.0", "0.0.0.0/0", "::", "::/0"]);

let name;
if (plat === "aix") {
  // AIX `netstat` output is compatible with Solaris
  name = type() === "OS400" ? "ibmi" : "sunos";
} else {
  name = plat;
}

let promise = (_) => { throw new Error("Unsupported Platform"); };
let sync = (_) => { throw new Error("Unsupported Platform"); };

if (name === "android") {
  const args = {
    v4: ["-4", "r"],
    v6: ["-6", "r"],
  };

  const parse = stdout => {
    let result;

    (stdout || "").trim().split("\n").some(line => {
      const [_, gateway, iface] = /default via (.+?) dev (.+?)( |$)/.exec(line) || [];
      if (gateway && isIP(gateway)) {
        result = {gateway, interface: (iface ?? null)};
        return true;
      }
      return false;
    });

    if (!result) {
      throw new Error("Unable to determine default gateway");
    }

    return result;
  };

  promise = async family => {
    const {stdout} = await execa("ip", args[family]);
    return parse(stdout);
  };

  sync = family => {
    const {stdout} = execaSync("ip", args[family]);
    return parse(stdout);
  };
} else if (name === "darwin") {
  const args = {
    v4: ["-rn", "-f", "inet"],
    v6: ["-rn", "-f", "inet6"],
  };

  // The IPv4 gateway is in column 3 in Darwin 19 (macOS 10.15 Catalina) and higher,
  // previously it was in column 5
  const v4IfaceColumn = parseInt(release()) >= 19 ? 3 : 5;

  const parse = (stdout, family) => {
    let result;

    (stdout || "").trim().split("\n").some(line => {
      const results = line.split(/ +/) || [];
      const target = results[0];
      const gateway = results[1];
      const iface = results[family === "v4" ? v4IfaceColumn : 3];
      if (dests.has(target) && gateway && isIP(gateway)) {
        result = {gateway, interface: (iface ?? null)};
        return true;
      }
      return false;
    });

    if (!result) {
      throw new Error("Unable to determine default gateway");
    }

    return result;
  };

  promise = async family => {
    const {stdout} = await execa("netstat", args[family]);
    return parse(stdout, family);
  };

  sync = family => {
    const {stdout} = execaSync("netstat", args[family]);
    return parse(stdout, family);
  };
} else if (name === "freebsd") {
  const args = {
    v4: ["-rn", "-f", "inet"],
    v6: ["-rn", "-f", "inet6"],
  };

  const parse = stdout => {
    let result;

    (stdout || "").trim().split("\n").some(line => {
      const [target, gateway, _, iface] = line.split(/ +/) || [];
      if (dests.has(target) && gateway && isIP(gateway)) {
        result = {gateway, interface: (iface ?? null)};
        return true;
      }
      return false;
    });

    if (!result) {
      throw new Error("Unable to determine default gateway");
    }

    return result;
  };

  promise = async family => {
    const {stdout} = await execa("netstat", args[family]);
    return parse(stdout);
  };

  sync = family => {
    const {stdout} = execaSync("netstat", args[family]);
    return parse(stdout);
  };
} else if (name === "ibmi") {
  const args = {
    v4: "IPV4",
    v6: "IPV6",
  };

  const db2util = "/QOpenSys/pkgs/bin/db2util";
  const sql = "select NEXT_HOP, LOCAL_BINDING_INTERFACE from QSYS2.NETSTAT_ROUTE_INFO where ROUTE_TYPE='DFTROUTE' and NEXT_HOP!='*DIRECT' and CONNECTION_TYPE=?";

  const parse = stdout => {
    let result;
    try {
      const resultObj = JSON.parse(stdout);
      const gateway = resultObj.records[0].NEXT_HOP;
      const iface = resultObj.records[0].LOCAL_BINDING_INTERFACE;
      result = {gateway, iface};
    } catch {}
    if (!result) {
      throw new Error("Unable to determine default gateway");
    }
    return result;
  };

  promise = async family => {
    const {stdout} = await execa(db2util, [sql, "-p", args[family], "-o", "json"]);
    return parse(stdout);
  };

  sync = family => {
    const {stdout} = execaSync(db2util, [sql, "-p", args[family], "-o", "json"]);
    return parse(stdout);
  };
} else if (name === "linux") {
  const args = {
    v4: ["-4", "r"],
    v6: ["-6", "r"],
  };

  const parse = (stdout, family) => {
    let result;

    (stdout || "").trim().split("\n").some(line => {
      const results = /default( via .+?)?( dev .+?)( |$)/.exec(line) || [];
      const gateway = (results[1] || "").substring(5);
      const iface = (results[2] || "").substring(5);
      if (gateway && isIP(gateway)) { // default via 1.2.3.4 dev en0
        result = {gateway, interface: (iface ?? null)};
        return true;
      } else if (iface && !gateway) { // default via dev en0
        const interfaces = networkInterfaces();
        const addresses = interfaces[iface];
        if (!addresses || !addresses.length) return false;

        addresses.some(addr => {
          if (addr.family.substring(2) === family && isIP(addr.address)) {
            result = {gateway: addr.address, interface: (iface ?? null)};
            return true;
          }
          return false;
        });
      }
      return false;
    });

    if (!result) {
      throw new Error("Unable to determine default gateway");
    }

    return result;
  };

  promise = async family => {
    const {stdout} = await execa("ip", args[family]);
    return parse(stdout, family);
  };

  sync = family => {
    const {stdout} = execaSync("ip", args[family]);
    return parse(stdout, family);
  };
} else if (name === "openbsd") {
  const args = {
    v4: ["-rn", "-f", "inet"],
    v6: ["-rn", "-f", "inet6"],
  };

  const parse = stdout => {
    let result;

    (stdout || "").trim().split("\n").some(line => {
      const results = line.split(/ +/) || [];
      const target = results[0];
      const gateway = results[1];
      const iface = results[7];
      if (dests.has(target) && gateway && isIP(gateway)) {
        result = {gateway, interface: (iface ?? null)};
        return true;
      }
      return false;
    });

    if (!result) {
      throw new Error("Unable to determine default gateway");
    }

    return result;
  };

  promise = async family => {
    const {stdout} = await execa("netstat", args[family]);
    return parse(stdout);
  };

  sync = family => {
    const {stdout} = execaSync("netstat", args[family]);
    return parse(stdout);
  };
} else if (name === "sunos") {
  const args = {
    v4: ["-rn", "-f", "inet"],
    v6: ["-rn", "-f", "inet6"],
  };

  const parse = stdout => {
    let result;

    (stdout || "").trim().split("\n").some(line => {
      const results = line.split(/ +/) || [];
      const target = results[0];
      const gateway = results[1];
      const iface = results[5];
      if (dests.has(target) && gateway && isIP(gateway)) {
        result = {gateway, interface: (iface ?? null)};
        return true;
      }
      return false;
    });

    if (!result) {
      throw new Error("Unable to determine default gateway");
    }

    return result;
  };

  promise = async family => {
    const {stdout} = await execa("netstat", args[family]);
    return parse(stdout);
  };

  sync = family => {
    const {stdout} = execaSync("netstat", args[family]);
    return parse(stdout);
  };
} else if (name === "win32") {
  const gwArgs = "path Win32_NetworkAdapterConfiguration where IPEnabled=true get DefaultIPGateway,GatewayCostMetric,IPConnectionMetric,Index /format:table".split(" ");
  const ifArgs = index => `path Win32_NetworkAdapter where Index=${index} get NetConnectionID,MACAddress /format:table`.split(" ");

  const spawnOpts = {
    windowsHide: true,
  };

  // Parsing tables like this. The final metric is GatewayCostMetric + IPConnectionMetric
  //
  // DefaultIPGateway             GatewayCostMetric  Index  IPConnectionMetric
  // {"1.2.3.4", "2001:db8::1"}   {0, 256}           12     25
  // {"2.3.4.5"}                  {25}               12     55
  function parseGwTable(gwTable, family) {
    let [bestGw, bestMetric, bestId] = [null, null, null];

    for (let line of (gwTable || "").trim().split(/\r?\n/).splice(1)) {
      line = line.trim();
      const [_, gwArr, gwCostsArr, id, ipMetric] = /({.+?}) +({.+?}) +([0-9]+) +([0-9]+)/.exec(line) || [];
      if (!gwArr) continue;

      const gateways = (gwArr.match(/"(.+?)"/g) || []).map(match => match.substring(1, match.length - 1));
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

  promise = async family => {
    const {stdout} = await execa("wmic", gwArgs, spawnOpts);
    const [gateway, id] = parseGwTable(stdout, family) || [];

    if (!gateway) {
      throw new Error("Unable to determine default gateway");
    }

    let name;
    if (id) {
      const {stdout} = await execa("wmic", ifArgs(id), spawnOpts);
      name = parseIfTable(stdout);
    }

    return {gateway, interface: name ?? null};
  };

  sync = family => {
    const {stdout} = execaSync("wmic", gwArgs, spawnOpts);
    const [gateway, id] = parseGwTable(stdout, family) || [];

    if (!gateway) {
      throw new Error("Unable to determine default gateway");
    }

    let name;
    if (id) {
      const {stdout} = execaSync("wmic", ifArgs(id), spawnOpts);
      name = parseIfTable(stdout);
    }

    return {gateway, interface: name ?? null};
  };
}

export const gateway4async = () => promise("v4");
export const gateway6async = () => promise("v6");
export const gateway4sync = () => sync("v4");
export const gateway6sync = () => sync("v6");
