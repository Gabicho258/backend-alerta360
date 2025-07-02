import mongoose from "mongoose";

const incidentSchema = {
  description: String,
  incidentType: String,
  ubication: String,
  geolocation: String,
  evidence: Array,
  user_id: String,
  title: String,
  // Nuevos campos opcionales para FCM (no rompen compatibilidad)
  district: {
    type: String,
    default: null,
  },
  notificationSent: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "emergency"],
    default: "medium",
  },
};

const Incident = mongoose.model(
  "Incident",
  new mongoose.Schema(incidentSchema, { timestamps: true }),
  "incident"
);

export default Incident;
