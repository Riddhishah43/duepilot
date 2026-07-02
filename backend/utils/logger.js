const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.info;

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

const logger = {
  error(message, meta) { if (CURRENT_LEVEL >= 0) console.error(formatMessage("error", message, meta)); },
  warn(message, meta) { if (CURRENT_LEVEL >= 1) console.warn(formatMessage("warn", message, meta)); },
  info(message, meta) { if (CURRENT_LEVEL >= 2) console.log(formatMessage("info", message, meta)); },
  debug(message, meta) { if (CURRENT_LEVEL >= 3) console.log(formatMessage("debug", message, meta)); },
};

module.exports = logger;
