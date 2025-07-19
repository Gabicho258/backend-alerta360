// Script para debuggear los chats en la base de datos
import mongoose from "mongoose";
import { Chat } from "../api/models/index.js";
import "dotenv/config.js";

async function debugChats() {
  try {
    // Conectar a la base de datos
    const dbURI = process.env.DB_CONNECTION;
    await mongoose.connect(dbURI);
    console.log("🗄️  Connected to database");

    // Verificar todos los chats en la BD
    console.log("\n📊 === VERIFICACIÓN DE CHATS EN BD ===");

    const allChats = await Chat.find({});
    console.log(`\n📈 Total chats en BD: ${allChats.length}`);

    if (allChats.length === 0) {
      console.log("❌ No hay chats en la base de datos");
      console.log("💡 Ejecuta: node scripts/createDistrictChats.js");
      return;
    }

    // Agrupar por tipo
    const chatsByType = allChats.reduce((acc, chat) => {
      const type = chat.chatType || "undefined";
      if (!acc[type]) acc[type] = [];
      acc[type].push(chat);
      return acc;
    }, {});

    console.log("\n📋 Chats por tipo:");
    Object.keys(chatsByType).forEach((type) => {
      console.log(`  ${type}: ${chatsByType[type].length} chats`);
    });

    // Verificar chats de distrito específicamente
    console.log("\n🏘️  === CHATS DE DISTRITO ===");
    const districtChats = await Chat.find({
      chatType: "district_group",
    });

    console.log(`📍 Chats de distrito encontrados: ${districtChats.length}`);

    if (districtChats.length > 0) {
      console.log("\n📋 Lista de chats de distrito:");
      districtChats.forEach((chat, index) => {
        console.log(`  ${index + 1}. ${chat.chatName} (${chat.districtName})`);
        console.log(`     ID: ${chat._id}`);
        console.log(`     Activo: ${chat.isActive}`);
        console.log(`     Mensajes: ${chat.messageCount || 0}`);
        console.log(`     Creado: ${chat.createdAt}`);
        console.log("");
      });
    }

    // Verificar chats activos
    const activeDistrictChats = await Chat.find({
      chatType: "district_group",
      isActive: true,
    }).sort({ districtName: 1 });

    console.log(`✅ Chats de distrito activos: ${activeDistrictChats.length}`);

    // Verificar estructura de documentos
    if (districtChats.length > 0) {
      console.log("\n🔍 === ESTRUCTURA DEL PRIMER CHAT ===");
      const firstChat = districtChats[0];
      console.log("Estructura completa:");
      console.log(JSON.stringify(firstChat.toObject(), null, 2));
    }

    // Probar la query que usa el controlador
    console.log("\n🧪 === PROBANDO QUERY DEL CONTROLADOR ===");
    try {
      const controllerQuery = await Chat.find({
        chatType: "district_group",
        isActive: true,
      }).sort({ districtName: 1 });

      console.log(
        `✅ Query del controlador funciona: ${controllerQuery.length} resultados`
      );

      if (controllerQuery.length > 0) {
        console.log("✅ Primer resultado:");
        console.log({
          _id: controllerQuery[0]._id,
          chatName: controllerQuery[0].chatName,
          districtName: controllerQuery[0].districtName,
          chatType: controllerQuery[0].chatType,
          isActive: controllerQuery[0].isActive,
        });
      }
    } catch (queryError) {
      console.error("❌ Error en query del controlador:", queryError);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from database");
    process.exit(0);
  }
}

debugChats();

export { debugChats };
