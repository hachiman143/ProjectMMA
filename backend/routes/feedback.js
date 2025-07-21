const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const { protect } = require("../middleware/auth");

router.post("/", protect, feedbackController.createFeedback);
router.get("/:clubId", feedbackController.getFeedbacksByClub);

module.exports = router;
