"use strict";

const queries = {
  v4: "select NEXT_HOP, LOCAL_BINDING_INTERFACE from QSYS2.NETSTAT_ROUTE_INFO where ROUTE_TYPE='DFTROUTE' and NEXT_HOP!='*DIRECT' and CONNECTION_TYPE='IPV4'",
  v6: "select NEXT_HOP, LOCAL_BINDING_INTERFACE from QSYS2.NETSTAT_ROUTE_INFO where ROUTE_TYPE='DFTROUTE' and NEXT_HOP!='*DIRECT' and CONNECTION_TYPE='IPV6'",
};

const get = family => {
  return new Promise((resolve, reject) => {
    try {
      const idbConnector = require("idb-connector");

      const dbconn = new idbConnector.dbconn();
      dbconn.conn("*LOCAL");

      const dbstmt = new idbConnector.dbstmt(dbconn);
      dbstmt.exec(queries[family], results => {
        try {
          dbstmt.close();
          dbconn.disconn();
          dbconn.close();
        } catch (err) {
          return reject(err);
        }

        if (results && results[0] && results[0].NEXT_HOP) {
          resolve({
            gateway: results[0].NEXT_HOP,
            interface: results[0].LOCAL_BINDING_INTERFACE || null,
          });
        } else {
          return reject(new Error("Unable to determine default gateway"));
        }
      });
    } catch (err) {
      return reject(err);
    }
  });
};

const getSync = family => {
  const idbConnector = require("idb-connector");

  const dbconn = new idbConnector.dbconn();
  dbconn.conn("*LOCAL");

  const dbstmt = new idbConnector.dbstmt(dbconn);
  const results = dbstmt.execSync(queries[family]);

  dbstmt.close();
  dbconn.disconn();
  dbconn.close();

  if (results && results[0] && results[0].NEXT_HOP) {
    return {
      gateway: results[0].NEXT_HOP,
      interface: results[0].LOCAL_BINDING_INTERFACE || null,
    };
  } else {
    throw new Error("Unable to determine default gateway");
  }
};

const promise = family => get(family);
const sync = family => getSync(family);

module.exports.v4 = () => promise("v4");
module.exports.v6 = () => promise("v6");

module.exports.v4.sync = () => sync("v4");
module.exports.v6.sync = () => sync("v6");
