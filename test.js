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

if (defaultGateway.v4.sync) {
  const result = defaultGateway.v4.sync();
  assert(net.isIPv4(result.gateway));
}

if (defaultGateway.v6.sync) {
  const result = defaultGateway.v6.sync();
  assert(net.isIPv6(result.gateway));
}
