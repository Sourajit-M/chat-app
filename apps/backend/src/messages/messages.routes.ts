import { Router } from "express";
import { getMessages, sendMessage } from "./messages.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router()

router.use(protectRoute)

router.get("/:conversationId", getMessages)
router.post("/:conversationId", sendMessage)

export default router