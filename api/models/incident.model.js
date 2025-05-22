import mongoose from "mongoose";

const incidentSchema = {
  description: String,
  incidentType: String,
  ubication: String,
  geolocation: String,
  date: Date,
  evidence: Array,
  user_id: String,
};

const Incident = mongoose.model(
  "Incident",
  new mongoose.Schema(incidentSchema, { timestamps: true }),
  "incident"
);

export default Incident;
