"use strict";

const execa = require("execa");

const sql = "select NEXT_HOP, LOCAL_BINDING_INTERFACE from QSYS2.NETSTAT_ROUTE_INFO where ROUTE_TYPE='DFTROUTE' and NEXT_HOP!='*DIRECT' and CONNECTION_TYPE=?";

const checkVariant = () => {if(require("os").type() != "OS400") throw new Error("Unsupported AIX variant"); }

const parse = stdout => {
  let result;
  try {
      let resultObj = JSON.parse(stdout);
      const gateway = resultObj.records[0].NEXT_HOP;
      const iface = +resultObj.records[0].LOCAL_BINDING_INTERFACE;
      result = {gateway, iface};
  } catch {} 
  if (!result) {
    throw new Error("Unable to determine default gateway");
  }
  return result;
};

const promise = family => {
  checkVariant();
  return execa.stdout("/QOpenSys/pkgs/bin/db2util", [sql, "-p", family, "-o", "json"]).then(stdout => {
    return parse(stdout);
  });
};

const sync = family => {
  checkVariant();
  const result = execa.sync("/QOpenSys/pkgs/bin/db2util", [sql, "-p", family, "-o", "json"]);
  return parse(result.stdout);
};

module.exports.v4 = () => promise("IPV4");
module.exports.v6 = () => promise("IPV6");

module.exports.v4.sync = () => sync("IPV4");
module.exports.v6.sync = () => sync("IPV6");
