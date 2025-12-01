// controllers/health.controller.js

exports.healthCheck = async (req, res) => {
    try {
        res.status(200).json({
            status: "ok",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Health check failed",
            error: error.message,
        });
    }
};
