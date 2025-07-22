const Booking = require("../models/Booking");
const Table = require("../models/Table");
const Club = require("../models/Club");

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const {
      clubId,
      tableId,
      startTime,
      duration,
      bookingType,
      comboDetails,
      notes,
    } = req.body;
    // Check if table exists and is available
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bàn",
      });
    }

    if (table.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Bàn không khả dụng",
      });
    }

    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quán",
      });
    }

    // Calculate end time
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(
      startDateTime.getTime() + duration * 60 * 60 * 1000
    );

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      table: tableId,
      status: { $in: ["pending", "confirmed", "active"] },
      $or: [
        {
          startTime: { $lt: endDateTime },
          endTime: { $gt: startDateTime },
        },
      ],
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: "Bàn đã được đặt trong khoảng thời gian này",
      });
    }

    // Calculate total price
    let totalPrice = table.pricePerHour * duration;
    let comboInfo = null;

    if (bookingType === "combo" && comboDetails) {
      comboInfo = {
        name: comboDetails.name,
        hours: comboDetails.hours,
        discount: comboDetails.discount,
        originalPrice: table.pricePerHour * comboDetails.hours,
      };
      totalPrice = table.pricePerHour * comboDetails.hours;
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.userId,
      club: clubId,
      table: tableId,
      startTime: startDateTime,
      endTime: endDateTime,
      duration,
      totalPrice,
      bookingType,
      comboDetails: comboInfo,
      notes,
    });

    // Update table status
    table.status = "reserved";
    table.currentBooking = booking._id;
    await table.save();

    // Populate related data
    await booking.populate([
      { path: "user", select: "name email" },
      { path: "club", select: "name address" },
      { path: "table", select: "number type" },
    ]);

    res.status(201).json({
      success: true,
      message: "Đặt bàn thành công",
      data: { booking },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user.userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate([
        { path: "club", select: "name address images" },
        { path: "table", select: "number type" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate([
      { path: "user", select: "name email phone" },
      { path: "club", select: "name address phone" },
      { path: "table", select: "number type" },
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt bàn",
      });
    }

    // Check if user owns this booking or is admin
    if (
      booking.user._id.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xem đặt bàn này",
      });
    }

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt bàn",
      });
    }

    // Check permissions
    const isOwner = booking.user.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";
    const isClubOwner = req.user.role === "club_owner";

    if (!isOwner && !isAdmin && !isClubOwner) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền cập nhật đặt bàn này",
      });
    }

    // Update booking status
    booking.status = status;

    if (status === "cancelled") {
      booking.cancelledBy = req.user.userId;
      booking.cancelledAt = new Date();
    }
   
    await booking.save();

    // Update table status if booking is cancelled
    if (status === "cancelled") {
      const table = await Table.findById(booking.table);
      if (table) {
        table.status = "available";
        table.currentBooking = null;
        await table.save();
      }
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: { booking },
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt bàn",
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền hủy đặt bàn này",
      });
    }

    // Check if booking can be cancelled
    if (["cancelled", "completed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đặt bàn này",
      });
    }

    // Cancel booking
    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user.userId;
    booking.cancelledAt = new Date();
    
    await booking.save();

    // Update table status
    const table = await Table.findById(booking.table);
    if (table) {
      table.status = "available";
      table.currentBooking = null;
      await table.save();
    }

    res.json({
      success: true,
      message: "Hủy đặt bàn thành công",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Get club bookings (for club owners)
// @route   GET /api/bookings/club/:clubId
// @access  Private (Club Owner/Admin)
const getClubBookings = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { club: req.params.clubId };
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.startTime = { $gte: startOfDay, $lt: endOfDay };
    }

    const bookings = await Booking.find(query)
      .populate([
        { path: "user", select: "name email phone" },
        { path: "table", select: "number type" },
      ])
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get club bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const getAllUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("table")
      .populate("club");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy danh sách bookings", error });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getClubBookings,
  getAllUserBookings,
};
