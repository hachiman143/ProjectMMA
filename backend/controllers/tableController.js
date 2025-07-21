const Table = require('../models/Table');
const Club = require('../models/Club');

// @desc    Get tables by club
// @route   GET /api/tables/club/:clubId
// @access  Public
const getClubTables = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { status, type } = req.query;

        // Check if club exists
        const club = await Club.findById(clubId);
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quán'
            });
        }

        const query = { club: clubId, isActive: true };

        if (status) {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        const tables = await Table.find(query)
            .sort({ number: 1 });

        // Get statistics
        const totalTables = tables.length;
        const availableTables = tables.filter(table => table.status === 'available').length;
        const occupiedTables = tables.filter(table => table.status === 'occupied').length;
        const reservedTables = tables.filter(table => table.status === 'reserved').length;
        const maintenanceTables = tables.filter(table => table.status === 'maintenance').length;

        res.json({
            success: true,
            data: {
                tables,
                stats: {
                    totalTables,
                    availableTables,
                    occupiedTables,
                    reservedTables,
                    maintenanceTables
                }
            }
        });
    } catch (error) {
        console.error('Get club tables error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Public
const getTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id)
            .populate('club', 'name address');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }

        res.json({
            success: true,
            data: { table }
        });
    } catch (error) {
        console.error('Get table error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Create table
// @route   POST /api/tables
// @access  Private (Admin/Club Owner)
const createTable = async (req, res) => {
    try {
        const {
            number,
            type,
            club,
            pricePerHour,
            description,
            features
        } = req.body;

        // Check if club exists
        const clubExists = await Club.findById(club);
        if (!clubExists) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quán'
            });
        }

        // Check if table number already exists in this club
        const existingTable = await Table.findOne({ club, number });
        if (existingTable) {
            return res.status(400).json({
                success: false,
                message: 'Số bàn đã tồn tại trong quán này'
            });
        }

        const table = await Table.create({
            number,
            type,
            club,
            pricePerHour,
            description,
            features
        });

        res.status(201).json({
            success: true,
            message: 'Tạo bàn thành công',
            data: { table }
        });
    } catch (error) {
        console.error('Create table error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private (Admin/Club Owner)
const updateTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }

        // Check if user has permission to update this table
        const club = await Club.findById(table.club);
        if (club.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật bàn này'
            });
        }

        const updatedTable = await Table.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật bàn thành công',
            data: { table: updatedTable }
        });
    } catch (error) {
        console.error('Update table error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private (Admin/Club Owner)
const deleteTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }

        // Check if user has permission to delete this table
        const club = await Club.findById(table.club);
        if (club.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa bàn này'
            });
        }

        // Check if table is currently booked
        if (table.status === 'occupied' || table.status === 'reserved') {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa bàn đang được sử dụng'
            });
        }

        // Soft delete
        table.isActive = false;
        await table.save();

        res.json({
            success: true,
            message: 'Xóa bàn thành công'
        });
    } catch (error) {
        console.error('Delete table error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Update table status
// @route   PUT /api/tables/:id/status
// @access  Private (Admin/Club Owner)
const updateTableStatus = async (req, res) => {
    try {
        const { status, maintenanceNotes } = req.body;
        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }

        // Check if user has permission to update this table
        const club = await Club.findById(table.club);
        if (club.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật bàn này'
            });
        }

        table.status = status;
        if (status === 'maintenance' && maintenanceNotes) {
            table.maintenanceNotes = maintenanceNotes;
        }

        await table.save();

        res.json({
            success: true,
            message: 'Cập nhật trạng thái bàn thành công',
            data: { table }
        });
    } catch (error) {
        console.error('Update table status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getClubTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus
}; 