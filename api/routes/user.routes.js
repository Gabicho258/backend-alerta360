import express from "express";
import { UserController } from "../controllers/index.js";

// Métodos existentes
const {
  createUser,
  getAllUsers,
  updateUser,
  getOneUser,
  // Nuevos métodos FCM
  updateFcmToken,
  updateNotificationPreferences,
  subscribeToLocation,
} = UserController;

const router = express.Router();

const USER_ROUTES = {
  // Rutas existentes (sin /user ya que se monta en /api/v1/user)
  GET_ALL: "/",
  GET_ONE: "/:id",
  CREATE: "/create",
  UPDATE: "/update/:id",
  // Nuevas rutas para FCM
  UPDATE_FCM_TOKEN: "/:id/fcm-token",
  UPDATE_NOTIFICATION_PREFERENCES: "/:id/notification-preferences",
  SUBSCRIBE_LOCATION: "/:id/subscribe-location",
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
