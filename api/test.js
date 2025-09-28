module.exports = function handler(req, res) {
    res.status(200).json({
        message: "Test endpoint working!",
        timestamp: new Date().toISOString()
    });
}
