const pino = require("pino");
const pinoHttp = require("pino-http");
const crypto = require("crypto");
const config = require("./env.js");

const logger = pino({
    level: config.env === "production" ? "info" : "debug",
    redact: {
        paths: [
            "req.headers.cookie",
            "req.headers.authorization",
            "res.headers['set-cookie']",
            "password",
            "secret",
            "token"
        ],
        censor: "[REDACTED]"
    },
    timestamp: pino.stdTimeFunctions.isoTime
});

const httpLogger = pinoHttp({
    logger,
    genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID(),
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },
    autoLogging: {
        ignore: (req) => req.url === "/health" || req.url === "/ready" || req.url.startsWith("/css") || req.url.startsWith("/js")
    }
});

module.exports = {
    logger,
    httpLogger
};
