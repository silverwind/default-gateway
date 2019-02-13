"use strict";

const getSqlStatement = family => {
  let sql =
    "select NEXT_HOP from QSYS2.NETSTAT_ROUTE_INFO where ROUTE_TYPE='DFTROUTE'";

  if (family === "v4") {
    sql += " and CONNECTION_TYPE='IPV4'";
  } else {
    sql += " and CONNECTION_TYPE='IPV6'";
  }

  return sql;
};

const getGatewayInformationAsync = async family => {
  return new Promise((resolve, reject) => {
    const idbConnector = require("idb-connector");
    const dbconn = new idbConnector.dbconn();
    dbconn.conn("*LOCAL");

    const sql = getSqlStatement(family);

    const stmt = new idbConnector.dbstmt(dbconn);

    stmt.exec(sql, async results => {
      stmt.close();
      dbconn.disconn();
      dbconn.close();

      if (results && results[0] && results[0].NEXT_HOP) {
        resolve({
          gateway: results[0].NEXT_HOP
        });
      } else {
        reject(new Error("Unable to determine default gateway"));
      }
    });
  });
};

const getGatewayInformationSync = family => {
  const idbConnector = require("idb-connector");
  const dbconn = new idbConnector.dbconn();
  dbconn.conn("*LOCAL");

  const sql = getSqlStatement(family);

  const stmt = new idbConnector.dbstmt(dbconn);

  const results = stmt.execSync(sql);

  stmt.close();
  dbconn.disconn();
  dbconn.close();

  if (results && results[0] && results[0].NEXT_HOP) {
    return {
      gateway: results[0].NEXT_HOP
    };
  } else {
    throw new Error("Unable to determine default gateway");
  }
};

const promise = family => {
  return getGatewayInformationAsync(family);
};

const sync = family => {
  return getGatewayInformationSync(family);
};

module.exports.v4 = () => promise("v4");
module.exports.v6 = () => promise("v6");

module.exports.v4.sync = () => sync("v4");
module.exports.v6.sync = () => sync("v6");
