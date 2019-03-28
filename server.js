var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const http = require("http");
var source = require("rfr");
var favicon = require("serve-favicon");
const mongoose = require("mongoose");


const logger = source("logger");
var indexRouter = source("routes/index");
var usersRouter = source("routes/users");
var staticPaths = source("routes/static");

var views = source("views");

const config = source("config");

var app = express();
const server = http.Server(app);

app.set("title", "SOCIS - University of Guelph");
app.set("case sensitive routing", true);
app.use(favicon(path.join(config.__projectdir, "/public/img/favicon.ico")));

// view engine setup
app.engine("hbs", views.engine);
app.set("view engine", "hbs");


app.use(express.json());
app.use(express.urlencoded({ extended: false, }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(staticPaths);
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    logger.error("error: " + err);
    // render the error page
    res.status(err.status || 500);
    res.render("error", {whiteBackground: true, status: err.status || 500, message: err.message, });
});

/* set up the database and start the server */
const database = config.database;
let mongoUri = "mongodb://" + database.host;
if (Number.isInteger(Number(database.port))) {
    mongoUri += ":" + database.port;
} else if (database.port) {
    logger.warn("Invalid connection port '" + database.port + "' specified.");
}
mongoUri += "/" + database.db;
mongoose.connect(mongoUri, {
    user: database.user,
    pass: database.passwd,
    poolSize: 20,           // maintain up to 20 open sockets at a time
    useNewUrlParser: true,  // old URL parser is deprecated
});
mongoose.connection.on("connected", function () {
    logger.info("Connected to database: " + mongoUri);
});
mongoose.connection.on("error", function(err) {
    logger.error("Error on connection to " + mongoUri);
    logger.error(err);
});
mongoose.connection.on("disconnected", function () {
    logger.info("Disconnected from database: " + mongoUri);
});


/* listen and serve */
const port = config.server.port || 3000;
server.listen(port, function() {
    logger.info("Server is listening on localhost:" + port);
});

module.exports = app;
