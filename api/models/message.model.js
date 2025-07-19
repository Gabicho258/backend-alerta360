import mongoose from "mongoose";

const messageSchema = {
  chat_id: {
    type: String,
    required: true,
  },
  sender_id: {
    type: String,
    required: true,
  },
  sender_name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  messageType: {
    type: String,
    enum: ["text", "image", "file"],
    default: "text",
  },
  // Para futuras funcionalidades
  replyTo: {
    type: String,
    default: null,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
    default: null,
  },
};

const Message = mongoose.model(
  "Message",
  new mongoose.Schema(messageSchema, { timestamps: true }),
  "message"
);

export default Message;
