import { Server } from "socket.io";
import {
  createMessageWS,
  getRecentMessages,
} from "../api/controllers/message.controller.js";
import { Chat } from "../api/models/index.js";

class WebSocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userChatRooms = new Map(); // userId -> Set of chatIds
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.setupSocketHandlers();
    console.log("🔌 WebSocket server initialized");
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`📱 Client connected: ${socket.id}`);

      // Manejar autenticación/identificación del usuario
      socket.on("authenticate", async (data) => {
        try {
          const { userId, userName } = data;

          if (!userId) {
            socket.emit("error", { message: "userId is required" });
            return;
          }

          // Registrar usuario conectado
          this.connectedUsers.set(userId, socket.id);
          socket.userId = userId;
          socket.userName = userName || "Usuario";

          console.log(`✅ User authenticated: ${userName} (${userId})`);

          socket.emit("authenticated", {
            success: true,
            message: "Autenticado correctamente",
            userId: userId,
          });
        } catch (error) {
          console.error("Authentication error:", error);
          socket.emit("error", { message: "Error de autenticación" });
        }
      });

      // Unirse a un chat (room)
      socket.on("join_chat", async (data) => {
        try {
          const { chatId } = data;

          if (!socket.userId) {
            socket.emit("error", { message: "Usuario no autenticado" });
            return;
          }

          // Verificar que el chat existe
          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit("error", { message: "Chat no encontrado" });
            return;
          }

          // Unirse al room del chat
          socket.join(chatId);

          // Registrar en qué chats está el usuario
          if (!this.userChatRooms.has(socket.userId)) {
            this.userChatRooms.set(socket.userId, new Set());
          }
          this.userChatRooms.get(socket.userId).add(chatId);

          console.log(
            `👥 User ${socket.userName} joined chat: ${chat.chatName} (${chatId})`
          );

          // Enviar mensajes recientes del chat
          const recentMessages = await getRecentMessages(chatId, 20);
          socket.emit("recent_messages", {
            chatId: chatId,
            messages: recentMessages,
          });

          // Notificar a otros usuarios del chat que alguien se unió
          socket.to(chatId).emit("user_joined", {
            userId: socket.userId,
            userName: socket.userName,
            chatId: chatId,
          });

          socket.emit("joined_chat", {
            success: true,
            chatId: chatId,
            chatName: chat.chatName,
          });
        } catch (error) {
          console.error("Join chat error:", error);
          socket.emit("error", { message: "Error al unirse al chat" });
        }
      });

      // Salir de un chat
      socket.on("leave_chat", (data) => {
        try {
          const { chatId } = data;

          socket.leave(chatId);

          if (this.userChatRooms.has(socket.userId)) {
            this.userChatRooms.get(socket.userId).delete(chatId);
          }

          socket.to(chatId).emit("user_left", {
            userId: socket.userId,
            userName: socket.userName,
            chatId: chatId,
          });

          console.log(`👋 User ${socket.userName} left chat: ${chatId}`);
        } catch (error) {
          console.error("Leave chat error:", error);
        }
      });

      // Enviar mensaje
      socket.on("send_message", async (data) => {
        try {
          const { chatId, text } = data;

          if (!socket.userId) {
            socket.emit("error", { message: "Usuario no autenticado" });
            return;
          }

          if (!text || text.trim().length === 0) {
            socket.emit("error", {
              message: "El mensaje no puede estar vacío",
            });
            return;
          }

          if (text.length > 1000) {
            socket.emit("error", { message: "El mensaje es demasiado largo" });
            return;
          }

          // Crear el mensaje en la base de datos
          const result = await createMessageWS({
            chat_id: chatId,
            sender_id: socket.userId,
            text: text.trim(),
          });

          if (result.success) {
            // Emitir el mensaje a todos los usuarios en el chat
            this.io.to(chatId).emit("new_message", {
              message: result.message,
              chatId: chatId,
            });

            console.log(
              `💬 Message sent in chat ${chatId} by ${
                socket.userName
              }: ${text.substring(0, 50)}...`
            );
          } else {
            socket.emit("error", { message: "Error al enviar el mensaje" });
          }
        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("error", { message: "Error al enviar el mensaje" });
        }
      });

      // Indicador de "escribiendo"
      socket.on("typing_start", (data) => {
        const { chatId } = data;
        socket.to(chatId).emit("user_typing", {
          userId: socket.userId,
          userName: socket.userName,
          chatId: chatId,
        });
      });

      socket.on("typing_stop", (data) => {
        const { chatId } = data;
        socket.to(chatId).emit("user_stop_typing", {
          userId: socket.userId,
          userName: socket.userName,
          chatId: chatId,
        });
      });

      // Manejar desconexión
      socket.on("disconnect", () => {
        console.log(`📱❌ Client disconnected: ${socket.id}`);

        if (socket.userId) {
          // Limpiar registros del usuario
          this.connectedUsers.delete(socket.userId);

          // Notificar a todos los chats donde estaba el usuario
          if (this.userChatRooms.has(socket.userId)) {
            const userChats = this.userChatRooms.get(socket.userId);
            userChats.forEach((chatId) => {
              socket.to(chatId).emit("user_disconnected", {
                userId: socket.userId,
                userName: socket.userName,
                chatId: chatId,
              });
            });
            this.userChatRooms.delete(socket.userId);
          }
        }
      });

      // Manejar errores
      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    });
  }

  // Método para enviar notificaciones desde el servidor
  broadcastToChat(chatId, event, data) {
    if (this.io) {
      this.io.to(chatId).emit(event, data);
    }
  }

  // Enviar mensaje directo a un usuario específico
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Obtener usuarios conectados
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Verificar si un usuario está conectado
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Exportar instancia única
const wsManager = new WebSocketManager();
export default wsManager;
