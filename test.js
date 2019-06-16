"use strict";

const assert = require("assert");
const net = require("net");
const defaultGateway = require(".");

const exit = err => {
  if (err) console.error(err);
  process.exit(err ? 1 : 0);
};

const main = async () => {
  const async4 = await defaultGateway.v4();
  assert(net.isIPv4(async4.gateway));
  assert(async4.interface);

  // IPv6 tests are skipped because Travis VMs do not support IPv6
  if (!process.env.CI) {
    const async6 = await defaultGateway.v6();
    assert(net.isIPv6(async6.gateway));
    assert(async6.interface);
  }

  const sync4 = defaultGateway.v4.sync();
  assert(net.isIPv4(sync4.gateway));
  assert(sync4.interface);

  // IPv6 tests are skipped because Travis VMs do not support IPv6
  if (!process.env.CI) {
    const sync6 = defaultGateway.v6.sync();
    assert(net.isIPv6(sync6.gateway));
    assert(sync6.interface);
  }
};

main().then(exit).catch(exit);
