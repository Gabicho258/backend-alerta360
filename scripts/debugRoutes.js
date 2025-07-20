// Script para verificar el registro de rutas
import express from "express";
import { ChatController } from "../api/controllers/index.js";

console.log("🔍 === VERIFICACIÓN DE RUTAS ===");

// Verificar que ChatController tenga las funciones
console.log("ChatController methods:", Object.keys(ChatController));

// Simular la creación del router
const router = express.Router();

// Verificar si podemos acceder a las funciones
const {
  createChat,
  getChatsByUserId,
  getOneChat,
  createDistrictChat,
  getAllDistrictChats,
  getDistrictChat,
  updateDistrictChat,
} = ChatController;

console.log("\n📋 Verificando funciones extraídas:");
console.log("createChat:", typeof createChat);
console.log("getChatsByUserId:", typeof getChatsByUserId);
console.log("getOneChat:", typeof getOneChat);
console.log("createDistrictChat:", typeof createDistrictChat);
console.log("getAllDistrictChats:", typeof getAllDistrictChats);
console.log("getDistrictChat:", typeof getDistrictChat);
console.log("updateDistrictChat:", typeof updateDistrictChat);

// Intentar registrar las rutas
try {
  // Rutas existentes
  router.get("/chat/:id", getChatsByUserId);
  router.get("/chat/:owner_id/:friend_id", getOneChat);
  router.post("/chat/create", createChat);

  // Nuevas rutas para chats de distrito
  if (getAllDistrictChats) {
    router.get("/chat/district/all", getAllDistrictChats);
    console.log("✅ Ruta /chat/district/all registrada correctamente");
  } else {
    console.log(
      "❌ No se puede registrar /chat/district/all - función no encontrada"
    );
  }

  if (createDistrictChat) {
    router.post("/chat/district/create", createDistrictChat);
    console.log("✅ Ruta /chat/district/create registrada correctamente");
  }

  if (getDistrictChat) {
    router.get("/chat/district/:districtName", getDistrictChat);
    console.log(
      "✅ Ruta /chat/district/:districtName registrada correctamente"
    );
  }

  if (updateDistrictChat) {
    router.put("/chat/district/update/:id", updateDistrictChat);
    console.log("✅ Ruta /chat/district/update/:id registrada correctamente");
  }

  console.log("\n✅ Todas las rutas se registraron sin errores");
} catch (error) {
  console.error("❌ Error registrando rutas:", error);
}

process.exit(0);
