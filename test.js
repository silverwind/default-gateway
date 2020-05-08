"use strict";

const {v4, v6} = require(".");
const {env} = require("process");
const {isIPv4, isIPv6} = require("net");
const {platform} = require("os");
const {test, expect} = global;

// only Darwin has IPv6 on GitHub Actions
const canTestV6 = env.CI ? platform() === "darwin" : true;

test("v4 async", async () => {
  const result = await v4();
  expect(isIPv4(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});

test("v6 async", async () => {
  if (!canTestV6) return;
  const result = await v6();
  expect(isIPv6(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});

test("v4 sync", () => {
  const result = v4.sync();
  expect(isIPv4(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});

test("v6 sync", () => {
  if (!canTestV6) return;
  const result = v6.sync();
  expect(isIPv6(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});
