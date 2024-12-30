const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: String,
  priority: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Finished"], required: true },
  startTime: Date,
  endTime: Date,
  userId: { type: String, required: true },
});
module.exports = mongoose.model("Note", noteSchema);