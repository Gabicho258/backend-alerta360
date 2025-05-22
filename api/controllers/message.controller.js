import { Message } from "../models/index.js";

export const createMessage = async (req, res) => {
  const { chat_id, sender_id, text } = req.body;
  const message = new Message({ chat_id, sender_id, text });
  try {
    const messageCreated = await message.save();
    if (messageCreated) return res.status(201).json(messageCreated);
    else return res.status(404).json({ message: "Error creando el mensaje" });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getMessages = async (req, res) => {
  const { id: chat_id } = req.params;
  try {
    const messages = await Message.find({ chat_id });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};
