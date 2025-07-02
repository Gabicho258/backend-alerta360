import express from "express";
import { fcmService } from "../services/index.js";

const router = express.Router();

// Endpoint para enviar notificación de prueba
router.post("/fcm/test-notification", async (req, res) => {
  try {
    const { topic = "all_incidents", title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
      });
    }

    const result = await fcmService.sendToTopic(
      topic,
      { title, body },
      data || {}
    );

    res.status(200).json({
      success: true,
      message: "Test notification sent successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending test notification",
      error: error.message,
    });
  }
});

// Endpoint para probar notificación de incidente específico
router.post("/fcm/test-incident-notification", async (req, res) => {
  try {
    // Crear un incidente de prueba
    const testIncident = {
      _id: "test-incident-id-" + Date.now(),
      title: req.body.title || "Incidente de Prueba",
      description:
        req.body.description || "Este es un incidente de prueba para FCM",
      incidentType: req.body.incidentType || "Prueba",
      ubication: req.body.ubication || "Arequipa",
      district: req.body.district || "Cercado",
      user_id: "test-user",
    };

    const result = await fcmService.sendNewIncidentNotification(testIncident);

    res.status(200).json({
      success: result.success,
      message: result.success
        ? "Test incident notification sent successfully"
        : "Failed to send notification",
      result: result,
      testIncident: testIncident,
    });
  } catch (error) {
    console.error("Error sending test incident notification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending test incident notification",
      error: error.message,
    });
  }
});

// Endpoint para verificar si un token específico está suscrito
router.post("/fcm/check-token-subscription", async (req, res) => {
  try {
    const { token, topic } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    // Enviar mensaje directo a un token específico
    const testMessage = {
      token: token,
      notification: {
        title: "🧪 Test de Suscripción",
        body: `Probando notificación directa al token`,
      },
      data: {
        type: "debug_test",
        timestamp: Date.now().toString(),
        topic: topic || "direct_token_test",
      },
    };

    try {
      const result = await fcmService.sendToToken(
        token,
        testMessage.notification,
        testMessage.data
      );
      res.status(200).json({
        success: true,
        message: "Direct token notification sent",
        result: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to send to token",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error checking token subscription:", error);
    res.status(500).json({
      success: false,
      message: "Error checking token subscription",
      error: error.message,
    });
  }
});

// Endpoint para obtener información detallada de tópicos
router.get("/fcm/topics-info", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      availableTopics: {
        global: ["all_incidents", "emergency_alerts"],
        locations: [
          "location_arequipa",
          "location_lima",
          "location_socabaya",
          "location_av._sincronizado",
        ],
        testing: ["debug_test", "manual_test"],
      },
      instructions: {
        subscribe: "Use Firebase SDK subscribeToTopic() method",
        testDirect: "POST /fcm/check-token-subscription with your FCM token",
        testTopic: "POST /fcm/test-notification with specific topic",
      },
    });
  } catch (error) {
    console.error("Error getting topics info:", error);
    res.status(500).json({
      success: false,
      message: "Error getting topics info",
    });
  }
});

export default router;
