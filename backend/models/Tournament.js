const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên giải đấu là bắt buộc"],
      trim: true,
      maxlength: [100, "Tên giải đấu không được quá 100 ký tự"],
    },
    description: {
      type: String,
      maxlength: [1000, "Mô tả không được quá 1000 ký tự"],
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Quán tổ chức là bắt buộc"],
    },
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu là bắt buộc"],
    },
    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc là bắt buộc"],
    },
    startTime: {
      type: String,
      required: [true, "Giờ bắt đầu là bắt buộc"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Giờ không hợp lệ"],
    },
    maxParticipants: {
      type: Number,
      required: [true, "Số lượng người tham gia tối đa là bắt buộc"],
      min: [2, "Tối thiểu 2 người tham gia"],
      max: [64, "Tối đa 64 người tham gia"],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, "Số người tham gia không được âm"],
    },
    entryFee: {
      type: Number,
      required: [true, "Phí tham gia là bắt buộc"],
      min: [0, "Phí tham gia không được âm"],
    },
    prizePool: {
      type: Number,
      required: [true, "Tổng giải thưởng là bắt buộc"],
      min: [0, "Tổng giải thưởng không được âm"],
    },
    prizes: [
      {
        rank: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: String,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "open", "full", "in_progress", "completed", "cancelled"],
      default: "open",
    },
    tournamentType: {
      type: String,
      enum: [
        "single_elimination",
        "double_elimination",
        "round_robin",
        "swiss_system",
      ],
      default: "single_elimination",
    },
    rules: {
      type: String,
      maxlength: [2000, "Luật chơi không được quá 2000 ký tự"],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người tổ chức là bắt buộc"],
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        paymentStatus: {
          type: String,
          enum: ["pending", "paid", "refunded"],
          default: "pending",
        },
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
tournamentSchema.index({ club: 1, startDate: 1 });
tournamentSchema.index({ status: 1, startDate: 1 });
tournamentSchema.index({ organizer: 1 });

// Virtual for registration status
tournamentSchema.virtual("isFull").get(function () {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual for days until tournament
tournamentSchema.virtual("daysUntilStart").get(function () {
  const now = new Date();
  const start = new Date(this.startDate);
  const diffTime = start - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for registration percentage
tournamentSchema.virtual("registrationPercentage").get(function () {
  return Math.round((this.currentParticipants / this.maxParticipants) * 100);
});

// Ensure virtual fields are serialized
tournamentSchema.set("toJSON", { virtuals: true });
tournamentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Tournament", tournamentSchema);
