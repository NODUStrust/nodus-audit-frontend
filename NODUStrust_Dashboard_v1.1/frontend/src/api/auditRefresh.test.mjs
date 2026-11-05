import assert from "node:assert/strict";
import test from "node:test";
import { runAuditRefresh } from "./auditRefresh.mjs";

function createHarness(fetchLogs) {
  const lock = { inFlight: false };
  const events = [];
  let active = true;

  const refresh = () =>
    runAuditRefresh({
      lock,
      isActive: () => active,
      fetchLogs,
      onStart: () => events.push("start"),
      onSuccess: (logs) => events.push(["success", logs]),
      onError: (error) => events.push(["error", error.message]),
      onSettled: () => events.push("settled")
    });

  return {
    events,
    lock,
    refresh,
    deactivate: () => {
      active = false;
    }
  };
}

test("refreshes successfully and releases its in-flight lock", async () => {
  const logs = [{ id: 1, action: "review" }];
  const harness = createHarness(async () => logs);

  assert.equal(await harness.refresh(), true);
  assert.deepEqual(harness.events, ["start", ["success", logs], "settled"]);
  assert.equal(harness.lock.inFlight, false);
});

test("does not start an overlapping refresh", async () => {
  let resolveFetch;
  let fetchCount = 0;
  const harness = createHarness(
    () =>
      new Promise((resolve) => {
        fetchCount += 1;
        resolveFetch = resolve;
      })
  );

  const firstRefresh = harness.refresh();
  assert.equal(await harness.refresh(), false);
  assert.equal(fetchCount, 1);
  resolveFetch([]);
  assert.equal(await firstRefresh, true);
  assert.equal(harness.events.filter((event) => event === "start").length, 1);
});

test("keeps the last successful records after a failure and allows retry", async () => {
  const firstLogs = [{ id: 1, action: "first" }];
  const retryLogs = [{ id: 2, action: "retry" }];
  const displayedLogs = { current: [] };
  const errors = [];
  const lock = { inFlight: false };
  let fetchCount = 0;
  const refresh = () =>
    runAuditRefresh({
      lock,
      isActive: () => true,
      fetchLogs: async () => {
        fetchCount += 1;
        if (fetchCount === 2) {
          throw new Error("backend unavailable");
        }
        return fetchCount === 1 ? firstLogs : retryLogs;
      },
      onStart: () => {},
      onSuccess: (logs) => {
        displayedLogs.current = logs;
      },
      onError: (error) => errors.push(error.message),
      onSettled: () => {}
    });

  assert.equal(await refresh(), true);
  assert.deepEqual(displayedLogs.current, firstLogs);
  assert.equal(await refresh(), false);
  assert.deepEqual(displayedLogs.current, firstLogs);
  assert.deepEqual(errors, ["backend unavailable"]);
  assert.equal(lock.inFlight, false);
  assert.equal(await refresh(), true);
  assert.deepEqual(displayedLogs.current, retryLogs);
});

test("does not publish results after the panel becomes inactive", async () => {
  let resolveFetch;
  const harness = createHarness(
    () =>
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
  );

  const refresh = harness.refresh();
  harness.deactivate();
  resolveFetch([{ id: 1 }]);

  assert.equal(await refresh, true);
  assert.deepEqual(harness.events, ["start"]);
  assert.equal(harness.lock.inFlight, false);
});
