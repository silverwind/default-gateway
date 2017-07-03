"use strict";

// travis VMs don't have IPs on their interfaces
// https://docs.travis-ci.com/user/ci-environment/#Networking
if (process.env.CI) return;

const assert = require("assert");
const net = require("net");
const defaultGateway = require(".");

Promise.all([
  defaultGateway.v4(),
  defaultGateway.v6(),
]).then(results => {
  assert(net.isIPv4(results[0].gateway));
  assert(net.isIPv6(results[1].gateway));
}).catch(err => {
  console.error(err.stack);
  process.exit(1);
});
