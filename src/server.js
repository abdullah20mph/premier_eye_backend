require("module-alias/register");
const express = require("express");
require("dotenv").config();

const app = express();

// Core dependencies
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

// Routes (your main router)
const routes = require("@src/routes");

// Swagger
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { swaggerAuth } = require("@src/middleware");
const { swaggerDefinition } = require("./swagger");

// Build swagger docs
const swaggerDocs = swaggerJsDoc(swaggerDefinition);

// Other config
const SESSION_SECRET = process.env.SESSION_SECRET || "secret_key";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const corsOptions = {
    origin: CORS_ORIGIN,
    optionsSuccessStatus: 200,
};

// ---------------------------- SWAGGER SETUP ----------------------------
app.use(
    "/swagger",
    function (req, res, next) {
        let user = swaggerAuth(req);
        if (
            user === undefined ||
            user["name"] !== "admin" ||
            user["pass"] !== "adminpass"
        ) {
            res.statusCode = 401;
            res.setHeader("WWW-Authenticate", 'Basic realm="Node"');
            return res.end("Unauthorized");
        }
        next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, false, {
        docExpansion: "none",
    })
);

// ---------------------------- MIDDLEWARES ----------------------------
app.use(
    session({
        secret: SESSION_SECRET,
        name: "session_id",
        resave: true,
        saveUninitialized: true,
    })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(passport.session());

// ---------------------------- ROUTES ----------------------------
app.use(routes);

// Export app to be used in index.js
module.exports = app;
