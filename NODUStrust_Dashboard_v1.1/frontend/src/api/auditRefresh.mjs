export async function runAuditRefresh({
  lock,
  isActive,
  fetchLogs,
  onStart,
  onSuccess,
  onError,
  onSettled
}) {
  if (!isActive() || lock.inFlight) {
    return false;
  }

  lock.inFlight = true;
  onStart();

  try {
    const logs = await fetchLogs();
    if (isActive()) {
      onSuccess(logs);
    }
    return true;
  } catch (error) {
    if (isActive()) {
      onError(error);
    }
    return false;
  } finally {
    lock.inFlight = false;
    if (isActive()) {
      onSettled();
    }
  }
}
