import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-email", authController.verifyEmail);
router.get("/verify-email", authController.verifyEmailGet);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;