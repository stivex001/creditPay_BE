const jwt = require("jsonwebtoken");
const User = require("../model/user");
const logger = require("../utils/logger");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from the Authorization header: "Bearer <token>"
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.error("No token found in the Authorization header");
      return res
        .status(401)
        .json({ message: "No token, Authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve user from the database using the id in the token payload
    const user = await User.findById(decoded.id);

    if (!user) {
      logger.error("Couldn't find user");
      return res
        .status(401)
        .json({ message: "User not found, authorization denied" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication failed: ${error.message}`, { error });
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = {
  authMiddleware,
};
