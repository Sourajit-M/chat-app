import { Router } from "express";
import { getConversations, getOrCreateDM, createGroup, updateGroup, addGroupMember, removeGroupMember, getAllUsers } from "./conversations.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router()

router.use(protectRoute)

router.get("/", getConversations);
router.get("/users", getAllUsers);
router.post("/dm/:userId", getOrCreateDM);
router.post("/group", createGroup);
router.put("/group/:id", updateGroup);
router.post("/group/:id/members", addGroupMember);
router.delete("/group/:id/members/:userId", removeGroupMember);

export default router;