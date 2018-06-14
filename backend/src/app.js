const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const passport = require("passport");
const dc = require("./app/dependencyResolver");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const config = require("config");
const errorHandler = require("./http/middleware/errorHandler");
const fs = require("fs");
const expressWinston = require("express-winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const routes = dc.get("Router");
const app = express();

// Request logger for production

if (process.env.NODE_ENV === "production") {
    const logDirectory = path.join(__dirname, config.get("logsPath"));
    if(!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

    const transport = new (DailyRotateFile)({
        dirname: logDirectory,
        filename: "web-%DATE%.log",
        datePattern: "YYYY-MM-DD-HH",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d"
    });

    app.use(expressWinston.logger({
        transports: [transport],
        meta: true,
        expressFormat: true,
        colorize: false
    }));
} else {
    app.use(logger("dev"));
}

app.use(cookieParser());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", config.frontendUrl);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, Referer, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");

    next();
});

app.use("/api/v1", routes);

// Error logger for production

if (process.env.NODE_ENV === "production") {
    const logDirectory = path.join(__dirname, config.get("logsPath"));
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    const transport = new (DailyRotateFile)({
        dirname: logDirectory,
        filename: "errors-%DATE%.log",
        datePattern: "YYYY-MM-DD-HH",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d"
    });

    app.use(expressWinston.errorLogger({
        transports: [transport]
    }));
}

app.use(errorHandler.handleError);

module.exports = app;
