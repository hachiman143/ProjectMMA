const Tournament = require("../models/Tournament");
const Club = require("../models/Club");

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getAllTournaments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      clubId,
      search,
      startDate,
      endDate,
    } = req.query;

    const query = { isActive: true };

    if (status) {
      query.status = status;
    }

    if (clubId) {
      query.club = clubId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (page - 1) * limit;

    const tournaments = await Tournament.find(query)
      .populate("club", "name address")
      .populate("organizer", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ startDate: 1 });

    const total = await Tournament.countDocuments(query);

    res.json({
      success: true,
      data: tournaments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all tournaments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id
// @access  Public
const getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("club", "name address phone")
      .populate("organizer", "name email")
      .populate("participants.user", "name email");

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giải đấu",
      });
    }

    res.json({
      success: true,
      data: { tournament },
    });
  } catch (error) {
    console.error("Get tournament error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Private (Admin/Club Owner)
const createTournament = async (req, res) => {
  try {
    const {
      name,
      description,
      club,
      startDate,
      endDate,
      startTime,
      maxParticipants,
      entryFee,
      prizePool,
      tournamentType,
      rules,
      prizes,
    } = req.body;

    // Check if club exists
    const clubExists = await Club.findById(club);
    if (!clubExists) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quán",
      });
    }

    // Check if user is club owner or admin
    if (
      clubExists.owner.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền tạo giải đấu cho quán này",
      });
    }

    const tournament = await Tournament.create({
      name,
      description,
      club,
      startDate,
      endDate,
      startTime,
      maxParticipants,
      entryFee,
      prizePool,
      tournamentType,
      rules,
      prizes,
      organizer: req.user.userId,
    });

    await tournament.populate([
      { path: "club", select: "name address" },
      { path: "organizer", select: "name" },
    ]);

    res.status(201).json({
      success: true,
      message: "Tạo giải đấu thành công",
      data: { tournament },
    });
  } catch (error) {
    console.error("Create tournament error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Admin/Club Owner)
const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giải đấu",
      });
    }

    // Check if user is organizer or admin
    if (
      tournament.organizer.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền cập nhật giải đấu này",
      });
    }

    // Check if tournament has started
    if (
      tournament.status === "in_progress" ||
      tournament.status === "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "Không thể cập nhật giải đấu đã bắt đầu",
      });
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Cập nhật giải đấu thành công",
      data: { tournament: updatedTournament },
    });
  } catch (error) {
    console.error("Update tournament error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Admin/Club Owner)
const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giải đấu",
      });
    }

    // Check if user is organizer or admin
    if (
      tournament.organizer.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xóa giải đấu này",
      });
    }

    // Check if tournament has participants
    if (tournament.currentParticipants > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa giải đấu đã có người đăng ký",
      });
    }

    // Soft delete
    tournament.isActive = false;
    await tournament.save();

    res.json({
      success: true,
      message: "Xóa giải đấu thành công",
    });
  } catch (error) {
    console.error("Delete tournament error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Register for tournament
// @route   POST /api/tournaments/:id/register
// @access  Private
const registerForTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    console.log({ tournament });
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giải đấu",
      });
    }

    // Check if tournament is open for registration
    if (tournament.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Giải đấu không mở đăng ký",
      });
    }

    // Check if tournament is full
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Giải đấu đã đủ số lượng người tham gia",
      });
    }

    // Check if user is already registered
    const isAlreadyRegistered = tournament.participants.some(
      (participant) =>
        participant.user.toString() === req.user.userId.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đăng ký tham gia giải đấu này",
      });
    }

    // Add user to participants
    tournament.participants.push({
      user: req.user.userId,
      registeredAt: new Date(),
    });

    tournament.currentParticipants += 1;

    // Update status if full
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      tournament.status = "full";
    }

    await tournament.save();

    res.json({
      success: true,
      message: "Đăng ký tham gia giải đấu thành công",
      data: {
        currentParticipants: tournament.currentParticipants,
        maxParticipants: tournament.maxParticipants,
      },
    });
  } catch (error) {
    console.error("Register for tournament error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Unregister from tournament
// @route   DELETE /api/tournaments/:id/unregister
// @access  Private
const unregisterFromTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giải đấu",
      });
    }

    // Check if user is registered
    const participantIndex = tournament.participants.findIndex(
      (participant) => participant.user.toString() === req.user.userId
    );

    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa đăng ký tham gia giải đấu này",
      });
    }

    // Remove user from participants
    tournament.participants.splice(participantIndex, 1);
    tournament.currentParticipants -= 1;

    // Update status if no longer full
    if (
      tournament.status === "full" &&
      tournament.currentParticipants < tournament.maxParticipants
    ) {
      tournament.status = "open";
    }

    await tournament.save();

    res.json({
      success: true,
      message: "Hủy đăng ký tham gia giải đấu thành công",
      data: {
        currentParticipants: tournament.currentParticipants,
        maxParticipants: tournament.maxParticipants,
      },
    });
  } catch (error) {
    console.error("Unregister from tournament error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTournaments,
  getTournament,
  createTournament,
  updateTournament,
  deleteTournament,
  registerForTournament,
  unregisterFromTournament,
};
