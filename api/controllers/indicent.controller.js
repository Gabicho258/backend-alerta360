import { Incident } from "../models/index.js";

export const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const createIncident = async (req, res) => {
  const newIncident = new Incident({ ...req.body });
  try {
    const incident = await newIncident.save();
    incident && res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const updateIncident = async (req, res) => {
  const { id: incident_id } = req.params;
  const incidentToUpdate = req.body;

  try {
    const incidentUpdated = await Incident.findByIdAndUpdate(
      incident_id,
      incidentToUpdate,
      { new: true }
    );
    if (incidentUpdated) {
      res.status(200).json(incidentUpdated);
    } else {
      res.status(204).json({ error: "Incident not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteIncident = async (req, res) => {
  const { id: incident_id } = req.params;
  const recipeToDelete = req.body;

  try {
    const incidentDeleted = await Incident.findByIdAndDelete(incident_id);
    if (incidentDeleted) {
      res.status(200).json(incidentDeleted);
    } else {
      res.status(204).json({ error: "Incident not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getOneIncident = async (req, res) => {
  const { id: incident_id } = req.params;

  try {
    const incident = await Incident.findById(incident_id);
    res.status(200).json(incident);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getIncidentsByUserId = async (req, res) => {
  const { id: user_id } = req.params;
  try {
    const incidents = await Incident.find({
      user_id,
    });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ error });
  }
};
