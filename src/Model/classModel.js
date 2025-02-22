const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    subject: String,
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    room: String,
    startDate: Date,
    endDate: Date,
    startTime: String,
    endTime: String,
    duration:String,
    trainingHours: Number,
    classType: { type: String, enum: ["In Class", "Online", "In Drive"] },
    studentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
