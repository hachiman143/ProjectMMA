const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

// Validation rules
const createBookingValidation = [
  body("clubId").isMongoId().withMessage("ID quán không hợp lệ"),
  body("tableId").isMongoId().withMessage("ID bàn không hợp lệ"),
  body("startTime").isISO8601().withMessage("Thời gian bắt đầu không hợp lệ"),
  body("duration")
    .isNumeric()
    .isFloat({ min: 0.5, max: 12 })
    .withMessage("Thời lượng phải từ 0.5 đến 12 giờ"),
  body("bookingType")
    .isIn(["hourly", "combo"])
    .withMessage("Loại đặt bàn không hợp lệ"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Ghi chú không được quá 500 ký tự"),
];

const updateStatusValidation = [
  body("status")
    .isIn(["pending", "confirmed", "active", "completed", "cancelled"])
    .withMessage("Trạng thái không hợp lệ"),
];

const cancelBookingValidation = [
  body("reason")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Lý do hủy không được quá 200 ký tự"),
];

// Protected routes
router.post(
  "/",
  protect,
  createBookingValidation,
  bookingController.createBooking
);
router.get("/", protect, bookingController.getUserBookings);
router.get("/:id", protect, bookingController.getBooking);
router.put(
  "/:id/status",
  protect,
  authorize("admin", "club_owner"),
  updateStatusValidation,
  bookingController.updateBookingStatus
);
router.put(
  "/:id/cancel",
  protect,
  cancelBookingValidation,
  bookingController.cancelBooking
);

// Club owner routes
router.get(
  "/club/:clubId",
  protect,
  authorize("admin", "club_owner"),
  bookingController.getClubBookings
);

module.exports = router;
