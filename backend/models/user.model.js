const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: "" },
    timezone: { type: String, default: "UTC" },
    productivityScore: { type: Number, default: 0 },
    bio: { type: String, default: "", maxlength: 200 },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    dailyGoal: { type: Number, default: 3 },
    weeklyGoal: { type: Number, default: 10 },
    preferredStudyTime: { type: String, enum: ["morning", "afternoon", "night"], default: "morning" },
    defaultView: { type: String, enum: ["list", "board", "calendar"], default: "list" },
    notificationPreferences: {
      startNow: { type: Boolean, default: true },
      bestTime: { type: Boolean, default: true },
      rescue: { type: Boolean, default: true },
      focus: { type: Boolean, default: true },
      habit: { type: Boolean, default: true },
      overload: { type: Boolean, default: true },
      missed: { type: Boolean, default: true },
      break: { type: Boolean, default: false },
      prediction: { type: Boolean, default: true },
      reinforcement: { type: Boolean, default: true },
    },
    focusPreferences: {
      pomodoroDuration: { type: Number, default: 25 },
      breakDuration: { type: Number, default: 5 },
      longBreakDuration: { type: Number, default: 15 },
      sessionsBeforeLongBreak: { type: Number, default: 4 },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
