import mongoose from "mongoose";

const ChatSchema = {
  members: Array,
};

const Chat = mongoose.model(
  "Chat",
  new mongoose.Schema(ChatSchema, { timestamps: true })
);

export default Chat;
