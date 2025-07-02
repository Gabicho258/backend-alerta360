import bcrypt from "bcrypt";
import { User } from "../models/index.js";

// MÉTODOS EXISTENTES (sin cambios)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -fcmToken"); // Excluir datos sensibles
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getOneUser = async (req, res) => {
  const { id: user_id } = req.params;

  try {
    const user = await User.findById(user_id).select("-password -fcmToken");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const createUser = async (req, res) => {
  // Encriptamos la contraseña
  const { email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 15);

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "User already exists" });

    // Creamos un nuevo usuario con la contraseña encriptada
    const newUser = new User({
      ...req.body,
      password: passwordHash,
      // Inicializar campos FCM con valores por defecto
      fcmToken: null,
      subscribedTopics: [],
      notificationPreferences: {
        incidents: true,
        emergencies: true,
        location: true,
      },
    });

    const user = await newUser.save();
    if (user) {
      // Excluir password de la respuesta
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.fcmToken;
      res.status(201).json(userResponse);
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const updateUser = async (req, res) => {
  const { id: user_id } = req.params;
  const userToUpdate = req.body;

  try {
    const userUpdated = await User.findByIdAndUpdate(user_id, userToUpdate, {
      new: true,
    }).select("-password -fcmToken");

    if (userUpdated) {
      res.status(200).json(userUpdated);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// NUEVOS MÉTODOS PARA FCM (no interfieren con los existentes)

export const updateFcmToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    const { id: user_id } = req.params;

    if (!fcm_token) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      user_id,
      { fcmToken: fcm_token },
      { new: true }
    ).select("-password -fcmToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`✅ FCM token updated for user: ${user_id}`);

    res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({
      success: false,
      message: "Error updating FCM token",
      error: error.message,
    });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const { id: user_id } = req.params;
    const { incidents, emergencies, location } = req.body;

    const user = await User.findByIdAndUpdate(
      user_id,
      {
        notificationPreferences: {
          incidents: incidents !== undefined ? incidents : true,
          emergencies: emergencies !== undefined ? emergencies : true,
          location: location !== undefined ? location : true,
        },
      },
      { new: true }
    ).select("-password -fcmToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification preferences",
      error: error.message,
    });
  }
};

export const subscribeToLocation = async (req, res) => {
  try {
    const { id: user_id } = req.params;
    const { district } = req.body;

    if (!district) {
      return res.status(400).json({
        success: false,
        message: "District is required",
      });
    }

    const locationTopic = `location_${district
      .toLowerCase()
      .replace(/\s+/g, "_")}`;

    const user = await User.findByIdAndUpdate(
      user_id,
      {
        $addToSet: { subscribedTopics: locationTopic },
        district: district, // También actualizar el distrito del usuario
      },
      { new: true }
    ).select("-password -fcmToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to district: ${district}`,
      subscribedTopics: user.subscribedTopics,
    });
  } catch (error) {
    console.error("Error subscribing to location:", error);
    res.status(500).json({
      success: false,
      message: "Error subscribing to location",
      error: error.message,
    });
  }
};
