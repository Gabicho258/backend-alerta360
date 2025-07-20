// Script para crear chats de distrito de Arequipa
// Ejecutar con: node scripts/createDistrictChats.js

import mongoose from "mongoose";
import { Chat } from "../api/models/index.js";
import "dotenv/config.js";
const AREQUIPA_DISTRICTS = [
  { name: "Cercado", description: "Chat del distrito Cercado de Arequipa" },
  {
    name: "Alto Selva Alegre",
    description: "Chat del distrito Alto Selva Alegre",
  },
  { name: "Cayma", description: "Chat del distrito Cayma" },
  { name: "Cerro Colorado", description: "Chat del distrito Cerro Colorado" },
  { name: "Characato", description: "Chat del distrito Characato" },
  { name: "Chiguata", description: "Chat del distrito Chiguata" },
  { name: "Jacobo Hunter", description: "Chat del distrito Jacobo Hunter" },
  {
    name: "José Luis Bustamante y Rivero",
    description: "Chat del distrito José Luis Bustamante y Rivero",
  },
  { name: "La Joya", description: "Chat del distrito La Joya" },
  { name: "Mariano Melgar", description: "Chat del distrito Mariano Melgar" },
  { name: "Miraflores", description: "Chat del distrito Miraflores" },
  { name: "Mollebaya", description: "Chat del distrito Mollebaya" },
  { name: "Paucarpata", description: "Chat del distrito Paucarpata" },
  { name: "Pocsi", description: "Chat del distrito Pocsi" },
  { name: "Polobaya", description: "Chat del distrito Polobaya" },
  { name: "Quequeña", description: "Chat del distrito Quequeña" },
  { name: "Sabandia", description: "Chat del distrito Sabandia" },
  { name: "Sachaca", description: "Chat del distrito Sachaca" },
  {
    name: "San Juan de Siguas",
    description: "Chat del distrito San Juan de Siguas",
  },
  {
    name: "San Juan de Tarucani",
    description: "Chat del distrito San Juan de Tarucani",
  },
  {
    name: "Santa Isabel de Siguas",
    description: "Chat del distrito Santa Isabel de Siguas",
  },
  {
    name: "Santa Rita de Siguas",
    description: "Chat del distrito Santa Rita de Siguas",
  },
  { name: "Socabaya", description: "Chat del distrito Socabaya" },
  { name: "Tiabaya", description: "Chat del distrito Tiabaya" },
  { name: "Uchumayo", description: "Chat del distrito Uchumayo" },
  { name: "Vitor", description: "Chat del distrito Vitor" },
  { name: "Yanahuara", description: "Chat del distrito Yanahuara" },
  { name: "Yarabamba", description: "Chat del distrito Yarabamba" },
  { name: "Yura", description: "Chat del distrito Yura" },
];

async function createDistrictChats() {
  try {
    // Conectar a la base de datos
    const dbURI = process.env.DB_CONNECTION;
    await mongoose.connect(dbURI);
    console.log("🗄️  Connected to database");

    let created = 0;
    let existing = 0;

    for (const district of AREQUIPA_DISTRICTS) {
      try {
        // Verificar si ya existe
        const existingChat = await Chat.findOne({
          chatType: "district_group",
          districtName: district.name,
          isActive: true,
        });

        if (existingChat) {
          console.log(`⚠️  Chat for ${district.name} already exists`);
          existing++;
          continue;
        }

        // Crear nuevo chat de distrito
        const newChat = new Chat({
          chatType: "district_group",
          districtName: district.name,
          chatName: `Chat ${district.name}`,
          description: district.description,
          members: [],
          isActive: true,
          messageCount: 0,
        });

        await newChat.save();
        console.log(`✅ Created chat for district: ${district.name}`);
        created++;
      } catch (error) {
        console.error(
          `❌ Error creating chat for ${district.name}:`,
          error.message
        );
      }
    }

    console.log("\n📊 Summary:");
    console.log(`✅ Created: ${created} chats`);
    console.log(`⚠️  Already existing: ${existing} chats`);
    console.log(`📱 Total districts: ${AREQUIPA_DISTRICTS.length}`);

    // Mostrar todos los chats creados
    const allDistrictChats = await Chat.find({
      chatType: "district_group",
      isActive: true,
    }).sort({ districtName: 1 });

    console.log("\n💬 All district chats:");
    allDistrictChats.forEach((chat) => {
      console.log(`   📍 ${chat.districtName} (ID: ${chat._id})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from database");
    process.exit(0);
  }
}

createDistrictChats();

export { createDistrictChats, AREQUIPA_DISTRICTS };
