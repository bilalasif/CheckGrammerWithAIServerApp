import express from "express";
import firebaseAuthController from "../controllers/firebase-auth-controller.js";
import verifyToken from '../middleware/index.js'
const router = express.Router();

router.post("/api/sign-up", firebaseAuthController.registerUser);
router.post("/api/sign-in", firebaseAuthController.loginUser);
router.post("/api/sign-out", firebaseAuthController.logoutUser);

router.get("/api/me", verifyToken, (req, res) => {
  return res.status(200).json({ message: "User authenticated", user: req.user });
});
export default router;
