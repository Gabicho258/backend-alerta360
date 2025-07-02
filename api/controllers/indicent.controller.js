import { Incident } from "../models/index.js";
import fcmService from "../services/fcmService.js";

export const getAllIncidents = async (req, res) => {
  try {
    // Soporte para ETag (sincronización incremental)
    const ifNoneMatch = req.headers["if-none-match"];

    const incidents = await Incident.find().sort({ updatedAt: -1 });

    // Generar ETag simple basado en la fecha de la última modificación
    const latestUpdate =
      incidents.length > 0 ? incidents[0].updatedAt : new Date();
    const etag = `"${latestUpdate.getTime()}"`;

    // Si el cliente tiene la misma versión, devolver 304
    if (ifNoneMatch === etag) {
      return res.status(304).end();
    }

    res.set("ETag", etag);
    res.status(200).json(incidents);
  } catch (error) {
    console.error("Error getting incidents:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createIncident = async (req, res) => {
  try {
    const newIncident = new Incident({ ...req.body });
    const incident = await newIncident.save();

    if (incident) {
      // Enviar respuesta inmediatamente
      res.status(201).json(incident);

      // Enviar notificación FCM de forma asíncrona para no bloquear la respuesta
      setImmediate(async () => {
        try {
          // Verificar que el incidente tenga _id antes de enviar notificación
          const idString = incident._id.toString();
          if (incident._id.toString()) {
            const result = await fcmService.sendNewIncidentNotification(
              incident
            );
            if (result.success) {
              // Marcar como notificación enviada
              await Incident.findByIdAndUpdate(incident._id, {
                notificationSent: true,
              });
              console.log(
                `✅ FCM notification sent for incident: ${incident._id}`
              );
            } else {
              console.log(
                `⚠️ FCM notification failed for incident: ${incident._id}`
              );
            }
          } else {
            console.error(
              "❌ Incident created without _id, cannot send notification"
            );
          }
        } catch (notificationError) {
          console.error(
            "❌ Failed to send FCM notification:",
            notificationError
          );
        }
      });
    }
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ error: error.message });
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
      // Enviar notificación de actualización
      setImmediate(async () => {
        try {
          await fcmService.sendIncidentUpdateNotification(
            incidentUpdated,
            "actualizado"
          );
          console.log(
            `✅ Update notification sent for incident: ${incident_id}`
          );
        } catch (notificationError) {
          console.error(
            "❌ Failed to send update notification:",
            notificationError
          );
        }
      });

      res.status(200).json(incidentUpdated);
    } else {
      res.status(404).json({ error: "Incident not found" });
    }
  } catch (error) {
    console.error("Error updating incident:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteIncident = async (req, res) => {
  const { id: incident_id } = req.params;

  try {
    const incidentDeleted = await Incident.findByIdAndDelete(incident_id);

    if (incidentDeleted) {
      // Enviar notificación de eliminación
      setImmediate(async () => {
        try {
          await fcmService.sendIncidentDeleteNotification(incidentDeleted);
          console.log(
            `✅ Delete notification sent for incident: ${incident_id}`
          );
        } catch (notificationError) {
          console.error(
            "❌ Failed to send delete notification:",
            notificationError
          );
        }
      });

      res.status(200).json(incidentDeleted);
    } else {
      res.status(404).json({ error: "Incident not found" });
    }
  } catch (error) {
    console.error("Error deleting incident:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getOneIncident = async (req, res) => {
  const { id: incident_id } = req.params;

  try {
    const incident = await Incident.findById(incident_id);
    if (incident) {
      res.status(200).json(incident);
    } else {
      res.status(404).json({ error: "Incident not found" });
    }
  } catch (error) {
    console.error("Error getting incident:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getIncidentsByUserId = async (req, res) => {
  const { id: user_id } = req.params;

  try {
    const incidents = await Incident.find({
      user_id,
    }).sort({ updatedAt: -1 });

    res.status(200).json(incidents);
  } catch (error) {
    console.error("Error getting incidents by user:", error);
    res.status(500).json({ error: error.message });
  }
};
