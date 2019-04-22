const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");
const source = require("rfr");
const favicon = require("serve-favicon");
const mongoose = require("mongoose");

const session = require("express-session");

const logger = source("logger");
const indexRouter = source("routes/index");
const usersRouter = source("routes/users");
const staticPaths = source("routes/static");
const middleware = source("middleware");
const error = source("models/http-errors");

const views = source("views");
const config = source("config");
const app = express();
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

/* Configure session management */
const sessionSettings = { // set the session
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {},
};

app.use(session(sessionSettings));

// require that the api and the /admin routes the user has a session
app.use(middleware.routeAuth);


app.use(staticPaths);
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(new error.Error(404));
});

// add error handeling middle ware, this will send the error messages
app.use(middleware.errorHandler);

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
