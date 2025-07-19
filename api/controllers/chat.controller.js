import { Chat } from "../models/index.js";

// Función para actualizar último mensaje del chat (movida aquí para evitar importación circular)
export const updateChatLastMessage = async (chatId, messageData) => {
  try {
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text: messageData.text,
        sender_id: messageData.sender_id,
        sender_name: messageData.sender_name,
        timestamp: new Date(),
      },
      $inc: { messageCount: 1 },
    });
  } catch (error) {
    console.error("Error updating chat last message:", error);
  }
};

// MÉTODOS EXISTENTES (para chats privados - mantener compatibilidad)
export const createChat = async (req, res) => {
  const { owner_id, friend_id } = req.body;
  try {
    const chat = await Chat.findOne({
      chatType: "private",
      members: { $all: [owner_id, friend_id] },
    });

    if (chat) return res.status(200).json(chat);

    const newChat = new Chat({
      chatType: "private",
      members: [owner_id, friend_id],
      chatName: "Chat Privado",
    });
    const chatSaved = await newChat.save();
    if (chatSaved) return res.status(201).json(chatSaved);
    else return res.status(404).send("Error creando chat");
  } catch (error) {
    console.error("Error in createChat:", error);
    res.status(500).json(error);
  }
};

export const getChatsByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const chats = await Chat.find({
      members: { $in: [id] },
      chatType: "private",
    });
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in getChatsByUserId:", error);
    res.status(500).json(error);
  }
};

export const getOneChat = async (req, res) => {
  const { owner_id, friend_id } = req.params;
  try {
    const chat = await Chat.find({
      chatType: "private",
      members: { $all: [owner_id, friend_id] },
    });
    res.status(200).json(chat);
  } catch (error) {
    console.error("Error in getOneChat:", error);
    res.status(500).json(error);
  }
};

// NUEVOS MÉTODOS PARA CHATS GRUPALES DE DISTRITO

export const createDistrictChat = async (req, res) => {
  console.log("🏗️  createDistrictChat called with body:", req.body);

  const { districtName, description } = req.body;

  try {
    // Verificar si ya existe un chat para este distrito
    const existingChat = await Chat.findOne({
      chatType: "district_group",
      districtName: districtName,
      isActive: true,
    });

    if (existingChat) {
      console.log("⚠️  District chat already exists:", existingChat);
      return res.status(400).json({
        error: "Ya existe un chat para este distrito",
        chat: existingChat,
      });
    }

    const newDistrictChat = new Chat({
      chatType: "district_group",
      districtName: districtName,
      chatName: `Chat ${districtName}`,
      description: description || `Chat grupal del distrito ${districtName}`,
      members: [], // Los chats de distrito no usan members
      isActive: true,
      messageCount: 0,
    });

    const chatSaved = await newDistrictChat.save();
    console.log("✅ District chat created:", chatSaved);

    if (chatSaved) {
      res.status(201).json(chatSaved);
    } else {
      res.status(400).json({ error: "Error creando chat de distrito" });
    }
  } catch (error) {
    console.error("❌ Error creating district chat:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllDistrictChats = async (req, res) => {
  console.log("📋 getAllDistrictChats called");

  try {
    const districtChats = await Chat.find({
      chatType: "district_group",
      isActive: true,
    }).sort({ districtName: 1 });

    console.log(`✅ Found ${districtChats.length} district chats`);

    res.status(200).json(districtChats);
  } catch (error) {
    console.error("❌ Error getting district chats:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getDistrictChat = async (req, res) => {
  const { districtName } = req.params;

  try {
    const chat = await Chat.findOne({
      chatType: "district_group",
      districtName: districtName,
      isActive: true,
    });

    if (!chat) {
      console.log(`❌ Chat not found for district: ${districtName}`);
      return res.status(404).json({ error: "Chat de distrito no encontrado" });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("❌ Error getting district chat:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateDistrictChat = async (req, res) => {
  const { id } = req.params;
  const { chatName, description, isActive } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      {
        chatName,
        description,
        isActive,
      },
      { new: true }
    );

    if (!updatedChat) {
      return res.status(404).json({ error: "Chat no encontrado" });
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("❌ Error updating district chat:", error);
    res.status(500).json({ error: error.message });
  }
};
