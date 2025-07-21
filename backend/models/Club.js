const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên quán là bắt buộc'],
        trim: true,
        maxlength: [100, 'Tên quán không được quá 100 ký tự']
    },
    address: {
        type: String,
        required: [true, 'Địa chỉ là bắt buộc'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Số điện thoại là bắt buộc'],
        match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    },
    email: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    description: {
        type: String,
        maxlength: [500, 'Mô tả không được quá 500 ký tự']
    },
    images: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Đánh giá không được âm'],
        max: [5, 'Đánh giá tối đa là 5']
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    pricePerHour: {
        type: Number,
        required: [true, 'Giá thuê theo giờ là bắt buộc'],
        min: [0, 'Giá không được âm']
    },
    openingHours: {
        open: {
            type: String,
            default: '07:00'
        },
        close: {
            type: String,
            default: '23:00'
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'Tọa độ là bắt buộc']
        }
    },
    amenities: [{
        type: String,
        enum: ['parking', 'wifi', 'air_conditioning', 'food', 'drinks', 'vip_room', 'tournament_space']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Chủ quán là bắt buộc']
    }
}, {
    timestamps: true
});

// Index for geospatial queries
clubSchema.index({ location: '2dsphere' });

// Virtual for average rating
clubSchema.virtual('averageRating').get(function () {
    return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
});

// Ensure virtual fields are serialized
clubSchema.set('toJSON', { virtuals: true });
clubSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Club', clubSchema); 