import { Router } from "express";
import { signup, login, logout, updateProfile, checkAuth, updateName } from "./auth.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.put("/profile/name", protectRoute, updateName);
router.get("/check", protectRoute, checkAuth);

export default router;