import {gateway4async, gateway4sync, gateway6async, gateway6sync} from "./index.js";
import {env} from "node:process";
import {isIPv4, isIPv6} from "node:net";
import {platform} from "node:os";

// only Darwin has IPv6 on GitHub Actions
const canTestV6 = env.CI ? platform() === "darwin" : true;

test("gateway4async async", async () => {
  const result = await gateway4async();
  expect(isIPv4(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});

test("gateway4async sync", () => {
  const result = gateway4sync();
  expect(isIPv4(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});

test("v6 async", async () => {
  if (!canTestV6) return;
  const result = await gateway6async();
  expect(isIPv6(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});

test("v6 sync", () => {
  if (!canTestV6) return;
  const result = gateway6sync();
  expect(isIPv6(result.gateway)).toBe(true);
  expect(typeof result.interface).toBe("string");
});
