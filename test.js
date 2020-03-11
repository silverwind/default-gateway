"use strict";

const {v4, v6} = require(".");
const {isIPv4, isIPv6} = require("net");
const {test, expect} = global;

test("v4 async", async () => {
  const result = await v4();
  expect(isIPv4(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});

test("v6 async", async () => {
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
  const result = v6.sync();
  expect(isIPv6(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});
