const winston = require("winston");

const loggers = {
  main: winston.createLogger({
    level: "error",
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "logs/startup.log" }),
      new winston.transports.File({ filename: "logs/combined.log" }),
    ],
  }),
  api: {
    genres: winston.createLogger({
      level: "http",
      transports: [
        new winston.transports.File({ filename: "logs/api/genres.log" }),
      ],
    }),
    movies: winston.createLogger({
      level: "http",
      transports: [
        new winston.transports.File({ filename: "logs/api/movies.log" }),
      ],
    }),
    customers: winston.createLogger({
      level: "http",
      transports: [
        new winston.transports.File({ filename: "logs/api/customers.log" }),
      ],
    }),
    rentals: winston.createLogger({
      level: "http",
      transports: [
        new winston.transports.File({ filename: "logs/api/rentals.log" }),
      ],
    }),
    users: winston.createLogger({
      level: "http",
      transports: [
        new winston.transports.File({ filename: "logs/api/users.log" }),
      ],
    }),
  },
  errorMiddleware: winston.createLogger({
    level: "info",
    transports: [
      new winston.transports.File({ filename: "logs/middleware.log" }),
      new winston.transports.File({ filename: "logs/combined.log" }),
    ],
  }),
  authorization: winston.createLogger({
    level: "error",
    transports: [
      new winston.transports.File({
        filename: "logs/security/authorization.log",
      }),
    ],
  }),
  authentication: winston.createLogger({
    level: "error",
    transports: [
      new winston.transports.File({
        filename: "logs/security/authentication.log",
      }),
    ],
  }),
};

module.exports = loggers;
