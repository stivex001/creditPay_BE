const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, errors } = format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
  level: "info", // Set the minimum log level
  format: combine(
    timestamp(),
    errors({ stack: true }), // Capture stack trace
    logFormat
  ),
  transports: [
    new transports.Console(), // Log to console
    // Add file transport for error logs
    new transports.File({ filename: "error.log", level: "error" }),
  ],
});

module.exports = logger;
