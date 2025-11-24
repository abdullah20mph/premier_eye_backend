"use strict";

const path = require("path");

const swaggerDefinition = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Voice CRM API",
      version: "1.0.0",
      description: "Auth + Leads API for your voice CRM backend",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        APIKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // ❗ FIXED PATHS — These MUST point to actual files, not folders
  apis: [
    path.join(__dirname, "routes/**/*.js"),
    path.join(__dirname, "controllers/**/*.js"),
  ],
};

module.exports = { swaggerDefinition };
