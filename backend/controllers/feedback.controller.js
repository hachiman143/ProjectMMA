const Feedback = require("../models/Feedback");

exports.createFeedback = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { clubId, rating, content } = req.body;

    if (!clubId || !rating || !content) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const feedback = new Feedback({ userId, clubId, rating, content });
    await feedback.save();

    res.status(201).json({ message: "Gửi đánh giá thành công", feedback });
  } catch (err) {
    console.error("Lỗi tạo feedback:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getFeedbacksByClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    const feedbacks = await Feedback.find({ clubId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Lỗi lấy feedback:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
