import mongoose from "mongoose";

const userSchema = {
  _id: {
    type: String,
    required: true,
  },
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  phone_number: String,
  district: String,
  dni: String,
  // Nuevos campos para FCM (opcionales para no romper compatibilidad)
  fcmToken: {
    type: String,
    default: null,
  },
  subscribedTopics: {
    type: [String],
    default: [],
  },
  notificationPreferences: {
    incidents: { type: Boolean, default: true },
    emergencies: { type: Boolean, default: true },
    location: { type: Boolean, default: true },
  },
};

const User = mongoose.model(
  "User",
  new mongoose.Schema(userSchema, { timestamps: true, _id: false }),
  "user"
);

export default User;
