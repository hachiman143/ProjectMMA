const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: [true, 'Số bàn là bắt buộc']
    },
    type: {
        type: String,
        enum: ['Standard', 'VIP', 'Tournament'],
        default: 'Standard'
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance', 'reserved'],
        default: 'available'
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: [true, 'Quán là bắt buộc']
    },
    pricePerHour: {
        type: Number,
        required: [true, 'Giá thuê theo giờ là bắt buộc'],
        min: [0, 'Giá không được âm']
    },
    description: {
        type: String,
        maxlength: [200, 'Mô tả không được quá 200 ký tự']
    },
    features: [{
        type: String,
        enum: ['air_conditioning', 'premium_cushions', 'tournament_standard', 'led_lighting']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    currentBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    maintenanceNotes: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index for club and number to ensure unique table numbers per club
tableSchema.index({ club: 1, number: 1 }, { unique: true });

// Virtual for availability status
tableSchema.virtual('isAvailable').get(function () {
    return this.status === 'available';
});

// Ensure virtual fields are serialized
tableSchema.set('toJSON', { virtuals: true });
tableSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Table', tableSchema); 