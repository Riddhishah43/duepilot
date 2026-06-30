const patternService = require("../services/pattern.service");

exports.getInsights = async (req, res, next) => {
  try {
    const insights = await patternService.getPatternInsights(req.user._id);
    res.json(insights);
  } catch (error) {
    next(error);
  }
};
