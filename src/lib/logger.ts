import { format } from "date-fns";
import fs from "fs";
import util from "util";
import winston from "winston";

type LogLevel = "error" | "warn" | "info" | "verbose" | "debug" | "silly";
const LEVELS: LogLevel[] = [
  "error",
  "warn",
  "info",
  "verbose",
  "debug",
  "silly",
];
const LEVEL: LogLevel = "debug";

const winstonLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === "production" ? LEVEL : "silly",
    }),
  ],
});

const writeLogType = (logLevel: LogLevel, writeSync = false) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...theArguments: any[]) {
    const args = Array.from(theArguments);

    const loggerMessage = args
      .map((_) => (typeof _ === "string" ? _ : _?.message || JSON.stringify(_)))
      .join(" ");
    if (process.env.NODE_ENV === "test") {
      const fileName = "testing-errors.log";
      const entry = `${format(Date.now(), "yyyy-MM-dd HH:mm:ss")} ${logLevel.toUpperCase()} ${loggerMessage} \n`;
      const flag = { flag: "a" };
      if (writeSync) {
        fs.writeFileSync(fileName, entry, flag);
        return;
      }
      fs.writeFile(fileName, entry, flag, (err) => {
        winstonLogger.error(err?.message);
      });
      return;
    }

    winstonLogger[logLevel](util.format(...args));

    if (
      process.env.NODE_ENV === "production" 
    ) {
      if (LEVELS.indexOf(logLevel) >= LEVELS.indexOf(LEVEL)) {
        return;
      }
    }
  };
};

export const logger = {
  silly: writeLogType("silly"),
  debug: writeLogType("debug"),
  verbose: writeLogType("verbose"),
  info: writeLogType("info"),
  warn: writeLogType("warn"),
  error: writeLogType("error"),
  errorSync: writeLogType("error", true),
}; 