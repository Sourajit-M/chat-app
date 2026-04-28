import { Router } from "express";
import { summariseConversation } from "./ai.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router();

router.use(protectRoute);

router.post("/summarize/:conversationId", summariseConversation);

export default router;