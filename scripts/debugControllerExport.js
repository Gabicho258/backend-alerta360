// Script para verificar que los controladores se están exportando correctamente
import { ChatController } from "../api/controllers/index.js";

console.log("🔍 === VERIFICACIÓN DE EXPORTACIONES ===");
console.log("ChatController keys:", Object.keys(ChatController));

// Verificar si las funciones existen
const functionsToCheck = [
  "createChat",
  "getChatsByUserId",
  "getOneChat",
  "createDistrictChat",
  "getAllDistrictChats",
  "getDistrictChat",
  "updateDistrictChat",
];

console.log("\n📋 Funciones esperadas vs encontradas:");
functionsToCheck.forEach((funcName) => {
  const exists = typeof ChatController[funcName] === "function";
  console.log(
    `  ${funcName}: ${exists ? "✅" : "❌"} ${exists ? "EXISTS" : "MISSING"}`
  );

  if (exists) {
    console.log(`    Type: ${typeof ChatController[funcName]}`);
  }
});

// Verificar específicamente getAllDistrictChats
if (ChatController.getAllDistrictChats) {
  console.log("\n✅ getAllDistrictChats found!");
  console.log(
    "Function:",
    ChatController.getAllDistrictChats.toString().substring(0, 200) + "..."
  );
} else {
  console.log("\n❌ getAllDistrictChats NOT FOUND!");
}

process.exit(0);
