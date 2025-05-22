import mongoose from "mongoose";

const messageSchema = {
  chat_id: String,
  sender_id: String,
  text: String,
};
const Message = mongoose.model(
  "Message",
  new mongoose.Schema(messageSchema, { timestamps: true }),
  "message"
);

export default Message;
