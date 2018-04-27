const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const passport = require("passport");
const dc = require("./app/dependencyResolver");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const config = require("config");

const routes = dc.get("Router");
const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.frontendUrl);
    res.header("Access-Control-Allow-Headers", "Origin, Referer, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");

    next();
});

app.use("/api/v1", routes);

app.use(function (req, res, next) {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use(async function (err, req, res) {
    res.status(err.status || 500).json({message: err.message});
});

module.exports = app;
