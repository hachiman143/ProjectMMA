const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Người dùng là bắt buộc']
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: [true, 'Quán là bắt buộc']
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: [true, 'Bàn là bắt buộc']
    },
    startTime: {
        type: Date,
        required: [true, 'Thời gian bắt đầu là bắt buộc']
    },
    endTime: {
        type: Date,
        required: [true, 'Thời gian kết thúc là bắt buộc']
    },
    duration: {
        type: Number, // in hours
        required: [true, 'Thời lượng là bắt buộc'],
        min: [0.5, 'Thời lượng tối thiểu là 30 phút'],
        max: [12, 'Thời lượng tối đa là 12 giờ']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Tổng tiền là bắt buộc'],
        min: [0, 'Tổng tiền không được âm']
    },
    bookingType: {
        type: String,
        enum: ['hourly', 'combo'],
        default: 'hourly'
    },
    comboDetails: {
        name: String,
        hours: Number,
        discount: Number,
        originalPrice: Number
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online'],
        default: 'cash'
    },
    notes: {
        type: String,
        maxlength: [500, 'Ghi chú không được quá 500 ký tự']
    },
    cancellationReason: {
        type: String
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ club: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ table: 1, startTime: 1, endTime: 1 });

// Virtual for booking duration in hours
bookingSchema.virtual('durationHours').get(function () {
    if (this.startTime && this.endTime) {
        return Math.ceil((this.endTime - this.startTime) / (1000 * 60 * 60));
    }
    return this.duration;
});

// Virtual for is active booking
bookingSchema.virtual('isActive').get(function () {
    const now = new Date();
    return this.status === 'active' && this.startTime <= now && this.endTime >= now;
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema); 