import admin from "firebase-admin";
import "dotenv/config.js";

class FCMService {
  constructor() {
    this.initializeFirebase();
  }

  initializeFirebase() {
    if (!admin.apps.length) {
      try {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });

        console.log("🔥 Firebase Admin SDK initialized successfully");
      } catch (error) {
        console.error("❌ Error initializing Firebase Admin SDK:", error);
      }
    }
  }

  async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: "high",
          notification: {
            icon: "ic_notification",
            color: "#FF5722",
            defaultSound: true,
            defaultVibrateTimings: true,
            channelId: "ALERTA360_INCIDENTS",
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: "default",
              category: "INCIDENT_ALERT",
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log(`📱 Successfully sent message to topic ${topic}:`, response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error(`❌ Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }

  async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: "high",
          notification: {
            icon: "ic_notification",
            color: "#FF5722",
            defaultSound: true,
            defaultVibrateTimings: true,
            channelId: "ALERTA360_INCIDENTS",
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: "default",
              category: "INCIDENT_ALERT",
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log(`📱 Successfully sent message to topic ${topic}:`, response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error(`❌ Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }

  async sendToToken(token, notification, data = {}) {
    try {
      const message = {
        token: token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: "high",
          notification: {
            icon: "ic_notification",
            color: "#FF5722",
            defaultSound: true,
            defaultVibrateTimings: true,
            channelId: "ALERTA360_INCIDENTS",
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: "default",
              category: "INCIDENT_ALERT",
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log(`📱 Successfully sent message to token:`, response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error(`❌ Error sending message to token:`, error);
      throw error;
    }
  }

  async sendNewIncidentNotification(incident) {
    try {
      // Verificar que el incidente tenga los campos necesarios
      if (!incident) {
        console.error("❌ Incident is null or undefined");
        return { success: false, error: "Incident is null" };
      }

      if (!incident._id) {
        console.error("❌ Incident._id is null or undefined");
        return { success: false, error: "Incident._id is null" };
      }

      const incidentId = incident._id.toString();
      const incidentType = incident.incidentType || "Incidente";
      const ubication = incident.ubication || "Ubicación no especificada";
      const title = incident.title || "Sin título";
      const description = incident.description || "Sin descripción";

      const notification = {
        title: "🚨 Nuevo Incidente Reportado",
        body: `${incidentType} en ${ubication}: ${title}`,
      };

      const data = {
        type: "new_incident",
        incident_id: incidentId,
        incident_type: incidentType,
        ubication: ubication,
        title: title,
        body: description,
      };

      console.log(`📱 Sending notification for incident: ${incidentId}`);

      // Enviar a todos los usuarios
      await this.sendToTopic("all_incidents", notification, data);

      // Enviar específicamente a la ubicación
      if (ubication && ubication !== "Ubicación no especificada") {
        const locationTopic = `location_${ubication
          .toLowerCase()
          .replace(/\s+/g, "_")}`;
        await this.sendToTopic(locationTopic, notification, data);
      }

      // Si el incidente tiene distrito específico, también enviar ahí
      if (incident.district) {
        const districtTopic = `location_${incident.district
          .toLowerCase()
          .replace(/\s+/g, "_")}`;
        await this.sendToTopic(districtTopic, notification, data);
      }

      // Si es emergencia, enviar a tópico especial
      if (incidentType && incidentType.toLowerCase().includes("emergencia")) {
        await this.sendToTopic(
          "emergency_alerts",
          {
            title: "🆘 EMERGENCIA",
            body: notification.body,
          },
          data
        );
      }

      console.log(`✅ Notification sent for new incident: ${incidentId}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Error sending incident notification:", error);
      return { success: false, error: error.message };
    }
  }

  async sendIncidentUpdateNotification(incident, updateType = "actualizado") {
    try {
      const notification = {
        title: "📝 Incidente Actualizado",
        body: `${incident.incidentType} en ${incident.ubication} ha sido ${updateType}`,
      };

      const data = {
        type: "incident_update",
        incident_id: incident._id.toString(),
        update_type: updateType,
        incident_type: incident.incidentType,
        ubication: incident.ubication,
      };

      await this.sendToTopic("all_incidents", notification, data);

      if (incident.ubication) {
        const locationTopic = `location_${incident.ubication
          .toLowerCase()
          .replace(/\s+/g, "_")}`;
        await this.sendToTopic(locationTopic, notification, data);
      }

      console.log(`✅ Update notification sent for incident: ${incident._id}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Error sending update notification:", error);
      return { success: false, error: error.message };
    }
  }

  async sendIncidentDeleteNotification(incident) {
    try {
      const notification = {
        title: "🗑️ Incidente Eliminado",
        body: `El incidente "${incident.title}" en ${incident.ubication} ha sido eliminado`,
      };

      const data = {
        type: "incident_delete",
        incident_id: incident._id.toString(),
        incident_type: incident.incidentType,
        ubication: incident.ubication,
      };

      await this.sendToTopic("all_incidents", notification, data);

      if (incident.ubication) {
        const locationTopic = `location_${incident.ubication
          .toLowerCase()
          .replace(/\s+/g, "_")}`;
        await this.sendToTopic(locationTopic, notification, data);
      }

      console.log(`✅ Delete notification sent for incident: ${incident._id}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Error sending delete notification:", error);
      return { success: false, error: error.message };
    }
  }
}

// Exportar instancia única
const fcmService = new FCMService();
export default fcmService;
