import bcrypt from "bcrypt";
import swaggerJsDoc from "swagger-jsdoc";
import winston from "winston";
import { config } from "../config/config.js";

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const validatePassword = (password, user) =>
  bcrypt.compareSync(password, user.password);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api Backend",
      version: "1.0.0",
      description: "Ecommerce API documentation",
    },
  },
  apis: ["./src/docs/*.yaml"],
};

export const specs = swaggerJsDoc(options);

let customLevels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
};
export const logger = winston.createLogger({
  levels: customLevels,
  transports: [
    new winston.transports.File({
      level: "error",
      filename: "./src/logs/errors.log",
      format: winston.format.combine(winston.format.timestamp()),
    }),
  ],
});

const consoleTransport = new winston.transports.Console({
  level: "debug",
  format: winston.format.combine(
    winston.format.colorize({
      colors: {
        fatal: "bold white redBG",
        error: "red",
        warning: "yellow",
        info: "blue",
        http: "magenta",
        debug: "green",
      },
    }),
    winston.format.simple()
  ),
});
if (config.MODE.toUpperCase() === "DEV") {
  logger.add(consoleTransport);
}

export const middLogger = (req, res, next) => {
  req.logger = logger;

  next();
};
