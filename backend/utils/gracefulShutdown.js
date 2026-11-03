// Shared flag: /api/health/ready returns 503 while we shut down, so the load balancer stops sending traffic.
export const state = { shuttingDown: false };

export const registerGracefulShutdown = ({
  server,
  closeConnections = async () => {}, // WebSockets never end by themselves, so they must be closed BEFORE server.close can finish
  cleanup = async () => {}, // e.g. close the database
  logger,
  timeoutMs,
  proc = process,
  exit = process.exit,
}) => {
  let started = false;

  const shutdown = async (reason, exitCode = 0) => {
    if (started) return; // a 2nd signal must not start a 2nd shutdown
    started = true;
    state.shuttingDown = true;
    logger.info({ reason }, "shutdown started");

    const timer = setTimeout(() => {
      logger.error({ timeoutMs }, "shutdown timed out - forcing exit");
      exit(1);
    }, timeoutMs);
    timer.unref();

    try {
      await closeConnections();
      await new Promise((resolve, reject) => {
        server.close((err) => (err && err.code !== "ERR_SERVER_NOT_RUNNING" ? reject(err) : resolve()));
        server.closeIdleConnections?.(); // idle keep-alive sockets would otherwise delay the close
      });
      await cleanup();
      clearTimeout(timer);
      logger.info("shutdown complete");
      exit(exitCode);
    } catch (err) {
      clearTimeout(timer);
      logger.error({ err }, "error during shutdown");
      exit(1);
    }
  };

  proc.on("SIGTERM", () => shutdown("SIGTERM"));
  proc.on("SIGINT", () => shutdown("SIGINT"));

  // A forgotten .catch() or an uncaught exception leaves the process in an unknown state:
  // log it, finish what we can, exit 1 and let the platform start a fresh instance.
  proc.on("unhandledRejection", (reason) => {
    logger.error({ err: reason }, "unhandledRejection");
    shutdown("unhandledRejection", 1);
  });
  proc.on("uncaughtException", (err) => {
    logger.fatal({ err }, "uncaughtException");
    shutdown("uncaughtException", 1);
  });

  return shutdown;
};