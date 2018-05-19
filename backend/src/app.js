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
const rfs = require("rotating-file-stream");

const routes = dc.get("Router");
const app = express();

if(process.env.NODE_ENV === "production") {
    const logDirectory = path.join(__dirname, "../log");
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    let stream = rfs("access.log", {
        interval: "1d", // rotate daily
        path: logDirectory
    });

    app.use(logger("combined", {stream: stream}));
} else {
    app.use(logger("dev"));
}

app.use(cookieParser());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.frontendUrl);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, Referer, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");

    next();
});

app.use("/api/v1", routes);
app.use(errorHandler.handleError);

module.exports = app;
