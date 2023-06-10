import m, {gateway4async, gateway4sync, gateway6async, gateway6sync} from "./index.js";
import {env} from "node:process";
import {isIPv4, isIPv6} from "node:net";
import {platform} from "node:os";

// only Darwin has IPv6 on GitHub Actions
const canTestV6 = env.CI ? platform() === "darwin" : true;

test("exports", () => {
  expect(m.gateway4async).toEqual(gateway4async);
  expect(m.gateway4sync).toEqual(gateway4sync);
  expect(m.gateway6async).toEqual(gateway6async);
  expect(m.gateway6sync).toEqual(gateway6sync);
});

test("gateway4async async", async () => {
  const result = await gateway4async();
  expect(isIPv4(result.gateway)).toBe(true);
  expect(result.int).toBeTruthy();
  expect(result.version).toEqual(4);
});

test("gateway4async sync", () => {
  const result = gateway4sync();
  expect(isIPv4(result.gateway)).toBe(true);
  expect(result.int).toBeTruthy();
  expect(result.version).toEqual(4);
});

test("v6 async", async () => {
  if (!canTestV6) return;
  const result = await gateway6async();
  expect(isIPv6(result.gateway)).toBe(true);
  expect(result.int).toBeTruthy();
  expect(result.version).toEqual(6);
});

test("v6 sync", () => {
  if (!canTestV6) return;
  const result = gateway6sync();
  expect(isIPv6(result.gateway)).toBe(true);
  expect(result.int).toBeTruthy();
  expect(result.version).toEqual(6);
});
