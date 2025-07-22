const Club = require('../models/Club');
const Table = require('../models/Table');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getAllClubs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            minPrice,
            maxPrice,
            rating,
            amenities,
            latitude,
            longitude,
            radius = 10 // km
        } = req.query;

        const query = { isActive: true };

        // Search by name or address
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by price
        if (minPrice || maxPrice) {
            query.pricePerHour = {};
            if (minPrice) query.pricePerHour.$gte = Number(minPrice);
            if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
        }

        // Filter by rating
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }

        // Filter by amenities
        if (amenities) {
            const amenitiesArray = amenities.split(',');
            query.amenities = { $in: amenitiesArray };
        }

        // Filter by location (geospatial query)
        if (latitude && longitude) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            };
        }

        const skip = (page - 1) * limit;

        const clubs = await Club.find(query)
            .populate('owner', 'name email')
            .skip(skip)
            .limit(Number(limit))
            .sort({ rating: -1, createdAt: -1 });

        const total = await Club.countDocuments(query);

        // Get table statistics for each club
        const clubsWithStats = await Promise.all(
            clubs.map(async (club) => {
                const tables = await Table.find({ club: club._id, isActive: true });
                const availableTables = tables.filter(table => table.status === 'available').length;

                return {
                    ...club.toObject(),
                    totalTables: tables.length,
                    availableTables
                };
            })
        );

        res.json({
            success: true,
            data: clubsWithStats,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all clubs error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
const getClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id)
            .populate('owner', 'name email phone');

        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quán'
            });
        }

        // Get tables for this club
        const tables = await Table.find({ club: club._id })
            .sort({ number: 1 });

        // Get table statistics
        const totalTables = tables.length;
        const availableTables = tables.filter(table => table.status === 'available').length;

        res.json({
            success: true,
            data: {
                club,
                tables,
                stats: {
                    totalTables,
                    availableTables,
                    occupiedTables: totalTables - availableTables
                }
            }
        });
    } catch (error) {
        console.error('Get club error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Create club
// @route   POST /api/clubs
// @access  Private (Admin/Club Owner)
const createClub = async (req, res) => {
    try {
        const {
            name,
            address,
            phone,
            email,
            description,
            pricePerHour,
            openingHours,
            location,
            amenities
        } = req.body;

        const club = await Club.create({
            name,
            address,
            phone,
            email,
            description,
            pricePerHour,
            openingHours,
            location,
            amenities,
            owner: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Tạo quán thành công',
            data: { club }
        });
    } catch (error) {
        console.error('Create club error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private (Owner/Admin)
const updateClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);

        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quán'
            });
        }

        // Check if user is owner or admin
        if (club.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật quán này'
            });
        }

        const updatedClub = await Club.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật quán thành công',
            data: { club: updatedClub }
        });
    } catch (error) {
        console.error('Update club error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private (Owner/Admin)
const deleteClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);

        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quán'
            });
        }

        // Check if user is owner or admin
        if (club.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa quán này'
            });
        }

        // Soft delete
        club.isActive = false;
        await club.save();

        res.json({
            success: true,
            message: 'Xóa quán thành công'
        });
    } catch (error) {
        console.error('Delete club error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Rate club
// @route   POST /api/clubs/:id/rate
// @access  Private
const getAllClubsForAdmin = async (req, res) => {
    try {
        const clubs = await Club.find().populate('owner', 'name email role');
        res.json({ success: true, data: clubs });
    } catch (error) {
        console.error('Admin get all clubs error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};
const rateClub = async (req, res) => {
    try {
        const { rating } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Đánh giá phải từ 1 đến 5'
            });
        }

        const club = await Club.findById(req.params.id);
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quán'
            });
        }

        // Update rating
        const newTotalRatings = club.totalRatings + 1;
        const newRating = ((club.rating * club.totalRatings) + rating) / newTotalRatings;

        club.rating = newRating;
        club.totalRatings = newTotalRatings;
        await club.save();

        res.json({
            success: true,
            message: 'Đánh giá thành công',
            data: {
                rating: club.rating,
                totalRatings: club.totalRatings
            }
        });
    } catch (error) {
        console.error('Rate club error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getAllClubs,
    getClub,
    createClub,
    updateClub,
    deleteClub,
    rateClub,
    getAllClubsForAdmin
}; 