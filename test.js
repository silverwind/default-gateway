"use strict";

const assert = require("assert");
const net = require("net");
const defaultGateway = require(".");

defaultGateway.v4().then(result => {
  assert(net.isIPv6(result.gateway));
}).catch(err => {
  console.error(err.stack);
  process.exit(1);
});
