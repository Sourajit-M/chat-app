import { Router } from "express";
import { getMessages, sendMessage, deleteMessage } from "./messages.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router()

router.use(protectRoute)

router.get("/:conversationId", getMessages)
router.post("/:conversationId", sendMessage)
router.delete("/:messageId", deleteMessage)

export default router