// controllers/stat.controller.js
const Club = require('../models/Club');
const Table = require('../models/Table');
const Tournament = require('../models/Tournament');

exports.getQuickStats = async (req, res) => {
  try {
    // Gỉa sử bạn có location người dùng, hoặc lấy tất cả quán
    const clubCount = await Club.countDocuments();

    const availableTableCount = await Table.countDocuments({ status: 'available' });

    const tournamentCount = await Tournament.countDocuments();

    res.json({
      clubs: clubCount,
      availableTables: availableTableCount,
      tournaments: tournamentCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê', error });
  }
};
