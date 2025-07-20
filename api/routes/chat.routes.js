import express from "express";
import { ChatController } from "../controllers/index.js";

const router = express.Router();

// Extraer métodos del controlador
const {
  // Métodos existentes (chats privados)
  createChat,
  getChatsByUserId,
  getOneChat,
  // Nuevos métodos (chats de distrito)
  createDistrictChat,
  getAllDistrictChats,
  getDistrictChat,
  updateDistrictChat,
} = ChatController;

const CHAT_ROUTES = {
  // Rutas existentes (sin /chat ya que se monta en /api/v1/chat)
  CREATE: "/create",
  GET_CHATS_BY_USER_ID: "/:id",
  GET_ONE: "/:owner_id/:friend_id",

  // Nuevas rutas para chats de distrito
  CREATE_DISTRICT_CHAT: "/district/create",
  GET_ALL_DISTRICT_CHATS: "/district/all",
  GET_DISTRICT_CHAT: "/district/:districtName",
  UPDATE_DISTRICT_CHAT: "/district/update/:id",
};

// === NUEVAS RUTAS PARA CHATS DE DISTRITO (PRIMERO para evitar conflictos) ===
router.get(CHAT_ROUTES.GET_ALL_DISTRICT_CHATS, getAllDistrictChats);
router.post(CHAT_ROUTES.CREATE_DISTRICT_CHAT, createDistrictChat);
router.get(CHAT_ROUTES.GET_DISTRICT_CHAT, getDistrictChat);
router.put(CHAT_ROUTES.UPDATE_DISTRICT_CHAT, updateDistrictChat);

// === RUTAS EXISTENTES (CHATS PRIVADOS) ===
router.get(CHAT_ROUTES.GET_CHATS_BY_USER_ID, getChatsByUserId);
router.get(CHAT_ROUTES.GET_ONE, getOneChat);
router.post(CHAT_ROUTES.CREATE, createChat);

export default router;
