import express from "express";
import { MessageController } from "../controllers/index.js";

const { createMessage, getMessages } = MessageController;

const router = express.Router();

const MESSAGE_ROUTES = {
  // Sin /message ya que se monta en /api/v1/message
  CREATE: "/create",
  GET_MESSAGES: "/:id",
};

router.post(MESSAGE_ROUTES.CREATE, createMessage);
router.get(MESSAGE_ROUTES.GET_MESSAGES, getMessages);

export default router;
