import express from "express";
import { UserController } from "../controllers/index.js";

// Métodos existentes
const {
  createUser,
  getAllUsers,
  updateUser,
  getOneUser,
  login,
  // Nuevos métodos FCM
  updateFcmToken,
  updateNotificationPreferences,
  subscribeToLocation,
} = UserController;

const router = express.Router();

const USER_ROUTES = {
  // Rutas existentes (sin cambios)
  GET_ALL: "/user",
  GET_ONE: "/user/:id",
  CREATE: "/user/create",
  UPDATE: "/user/update/:id",
  // Nuevas rutas para FCM
  UPDATE_FCM_TOKEN: "/user/:id/fcm-token",
  UPDATE_NOTIFICATION_PREFERENCES: "/user/:id/notification-preferences",
  SUBSCRIBE_LOCATION: "/user/:id/subscribe-location",
};

// Rutas existentes (sin cambios)
router.get(USER_ROUTES.GET_ALL, getAllUsers);
router.get(USER_ROUTES.GET_ONE, getOneUser);
router.put(USER_ROUTES.UPDATE, updateUser);
router.post(USER_ROUTES.CREATE, createUser);

// Nuevas rutas para FCM
router.put(USER_ROUTES.UPDATE_FCM_TOKEN, updateFcmToken);
router.put(
  USER_ROUTES.UPDATE_NOTIFICATION_PREFERENCES,
  updateNotificationPreferences
);
router.post(USER_ROUTES.SUBSCRIBE_LOCATION, subscribeToLocation);

export default router;
