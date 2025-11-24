"use strict";

require("module-alias/register");
require("dotenv").config();

const app = require("./server.js");
const { response } = require("@src/utils");

// Load PORT from environment
const PORT = process.env.API_PORT || 5000;

// ---------------------------- ERROR HANDLER ----------------------------
app.use((err, req, res, next) => {
    console.error("🔥 INTERNAL SERVER ERROR:", err);
    return response.send(0, 500, "Internal Server Error", null, res, err);
});

// ---------------------------- 404 HANDLER ----------------------------
app.use((req, res) => {
    return response.send(0, 404, "This route does not exist", null, res, null);
});


// ---------------------------- SAFE EXIT ----------------------------
process.on("SIGINT", () => {
    console.info("SIGINT signal received.");
    console.log("Shutting down gracefully...");
    process.exit(0);
});

// ---------------------------- START SERVER ----------------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📘 Swagger Docs at http://localhost:${PORT}/swagger`);
});
