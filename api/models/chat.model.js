import mongoose from "mongoose";

const ChatSchema = {
  chatType: {
    type: String,
    enum: ["private", "district_group"],
    required: true,
    default: "private",
  },
  // Para chats privados (mantener compatibilidad)
  members: {
    type: Array,
    default: [],
  },
  // Para chats grupales de distrito
  districtName: {
    type: String,
    default: null,
  },
  chatName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Información del último mensaje para mostrar en la lista
  lastMessage: {
    text: String,
    sender_id: String,
    sender_name: String,
    timestamp: Date,
  },
  // Contador de mensajes para badges
  messageCount: {
    type: Number,
    default: 0,
  },
};

const Chat = mongoose.model(
  "Chat",
  new mongoose.Schema(ChatSchema, { timestamps: true })
);

export default Chat;
