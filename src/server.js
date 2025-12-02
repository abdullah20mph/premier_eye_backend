require("module-alias/register");
const express = require("express");
require("dotenv").config();

const app = express();

// ---------- CORS MUST COME FIRST ----------
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { swaggerAuth } = require("@src/middleware");
const { swaggerDefinition } = require("./swagger");
const healthRoutes = require("./routes/health.routes");
const routes = require("@src/routes");

const swaggerDocs = swaggerJsDoc(swaggerDefinition);

const rawOrigins = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    console.log("🌍 Incoming Origin:", origin);

    if (!origin) return callback(null, true);
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin))
      return callback(null, true);

    console.log("❌ Blocked Origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// ---------- CALL CORS HERE ----------
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ---------- BODY PARSER ----------
app.use(bodyParser.json({ limit: "10mb" }));

// ---------- SESSION ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key",
    name: "session_id",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ---------- SWAGGER ----------
app.use(
  "/swagger",
  function (req, res, next) {
    let user = swaggerAuth(req);
    if (!user || user.name !== "admin" || user.pass !== "adminpass") {
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

// ---------- HEALTH ROUTE ----------
app.use("/", healthRoutes);

// ---------- MAIN ROUTES ----------
app.use(routes);

module.exports = app;
