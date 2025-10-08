module.exports = (req, res) => {
  res.status(200).json({
    message: "Multi-Vehicle Search API is running!",
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};
