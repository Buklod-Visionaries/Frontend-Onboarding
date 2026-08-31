import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["hr", "dept-rep", "employee"],
      timestamps: true,
    },
    department: {
      type: String,
      enum: ["laboratory", "cardiovascular", "admin"],
      required: function () {
        // not required if role is hr
        return this.role !== "hr";
      },
    },
    isFirstLogin: {
      type: Boolean,
      default: true, // true on production
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
