"use strict";

/**
 * Unified API response helper
 *
 * @param {number} success - 1 = success, 0 = failure
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human readable message
 * @param {object|null} data - Response payload
 * @param {object} res - Express response object
 * @param {object|null} error - Optional error object
 */
const send = (success, statusCode, message, data, res, error = null) => {
    let responseObject = {
        success: !!success,
        statusCode,
        message,
        data: data || null,
    };

    // Only include error details in development mode
    if (error && process.env.NODE_ENV === "development") {
        responseObject.error = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    return res.status(statusCode).json(responseObject);
};

module.exports = {
    send,
};
