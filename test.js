"use strict";

// IPv6 tests are skipped because Travis VMs do not support IPv6

const assert = require("assert");
const net = require("net");
const defaultGateway = require(".");

(async () => {
  const async4 = await defaultGateway.v4();
  assert(net.isIPv4((async4).gateway));

  if (!process.env.CI) {
    const async6 = await defaultGateway.v6();
    assert(net.isIPv6(async6.gateway));
  }

  const sync4 = defaultGateway.v4.sync();
  assert(net.isIPv4(sync4.gateway));

  if (!process.env.CI) {
    const sync6 = defaultGateway.v6.sync();
    assert(net.isIPv6(sync6.gateway));
  }
})();
