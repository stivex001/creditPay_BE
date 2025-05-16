const User = require("../model/user");
const logger = require("../utils/logger");

exports.getProfile = async (req, res) => {
  const userId = req?.user?._id;

  try {
    const profile = await User.findById(userId).select("-password");

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      profile,
    });
  } catch (error) {
    logger.error(`Error retrieving profile: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: "Error retrieving profile", error: error.message });
  }
};
