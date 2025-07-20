import { Message, Chat, User } from "../models/index.js";
import wsManager from "../../config/websocket.js";

// Función para actualizar último mensaje del chat
const updateChatLastMessage = async (chatId, messageData) => {
  try {
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text: messageData.text,
        sender_id: messageData.sender_id,
        sender_name: messageData.sender_name,
        timestamp: new Date(),
      },
      $inc: { messageCount: 1 },
    }, {new: true});

    const updatedChat = await Chat.findById(chatId);
    if (updatedChat) {
      wsManager.broadcastToChat(chatId, "chat_updated", {
        chatId: updatedChat._id,
        lastMessage: updatedChat.lastMessage,
        messageCount: updatedChat.messageCount,
      });
    }

    console.log("✅ Chat last message updated for:", chatId);
  } catch (error) {
    console.error("❌ Error updating chat last message:", error);
  }
};

// MÉTODO EXISTENTE (mantener compatibilidad)
export const createMessage = async (req, res) => {
  const { chat_id, sender_id, text } = req.body;
  console.log("💬 createMessage called:", { chat_id, sender_id, text });

  try {
    // Obtener información del usuario para el sender_name
    const user = await User.findById(sender_id).select("first_name last_name");
    if (!user) {
      console.log("❌ User not found:", sender_id);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const sender_name = `${user.first_name} ${user.last_name}`.trim();

    const message = new Message({
      chat_id,
      sender_id,
      sender_name,
      text,
    });

    const messageCreated = await message.save();

    if (messageCreated) {
      // Actualizar último mensaje del chat
      await updateChatLastMessage(chat_id, {
        text: text,
        sender_id: sender_id,
        sender_name: sender_name,
      });

      console.log("✅ Message created:", messageCreated);
      return res.status(201).json(messageCreated);
    } else {
      return res.status(404).json({ message: "Error creando el mensaje" });
    }
  } catch (error) {
    console.error("❌ Error creating message:", error);
    res.status(500).json(error);
  }
};

export const getMessages = async (req, res) => {
  const { id: chat_id } = req.params;
  const { page = 1, limit = 50 } = req.query;
  console.log(
    `📜 getMessages called for chat: ${chat_id}, page: ${page}, limit: ${limit}`
  );

  try {
    // Verificar que el chat existe
    const chat = await Chat.findById(chat_id);
    if (!chat) {
      console.log("❌ Chat not found:", chat_id);
      return res.status(404).json({ error: "Chat no encontrado" });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ chat_id })
      .sort({ createdAt: -1 }) // Más recientes primero
      .skip(skip)
      .limit(parseInt(limit));

    // Invertir para mostrar cronológicamente
    const sortedMessages = messages.reverse();

    const totalMessages = await Message.countDocuments({ chat_id });

    console.log(`✅ Found ${messages.length} messages for chat ${chat_id}`);

    res.status(200).json({
      messages: sortedMessages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages: totalMessages,
        hasMore: totalMessages > skip + messages.length,
      },
    });
  } catch (error) {
    console.error("❌ Error getting messages:", error);
    res.status(500).json(error);
  }
};



// NUEVO MÉTODO: Crear mensaje para WebSocket
export const createMessageWS = async (messageData) => {
  try {
    const { chat_id, sender_id, text } = messageData;
    console.log("💬 createMessageWS called:", messageData);

    // Obtener información del usuario
    const user = await User.findById(sender_id).select("first_name last_name");
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const sender_name = `${user.first_name} ${user.last_name}`.trim();

    const message = new Message({
      chat_id,
      sender_id,
      sender_name,
      text,
      messageType: "text",
    });

    const messageCreated = await message.save();

    if (messageCreated) {
      // Actualizar último mensaje del chat
      await updateChatLastMessage(chat_id, {
        text: text,
        sender_id: sender_id,
        sender_name: sender_name,
      });

      console.log("✅ WebSocket message created:", messageCreated);
      return {
        success: true,
        message: messageCreated,
      };
    }

    throw new Error("Error guardando el mensaje");
  } catch (error) {
    console.error("❌ Error creating message via WebSocket:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// NUEVO MÉTODO: Obtener mensajes recientes para WebSocket
export const getRecentMessages = async (chat_id, limit = 20) => {
  try {
    console.log(
      `📜 getRecentMessages called for chat: ${chat_id}, limit: ${limit}`
    );

    const messages = await Message.find({ chat_id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const sortedMessages = messages.reverse(); // Cronológico para el chat
    console.log(`✅ Found ${sortedMessages.length} recent messages`);

    return sortedMessages;
  } catch (error) {
    console.error("❌ Error getting recent messages:", error);
    return [];
  }
};
