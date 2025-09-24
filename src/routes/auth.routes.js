import { Router } from "express";
import { register, login, verify2FA } from "../controllers/auth.controller.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { loginValidation, registerValidation, verify2FAValidation } from "../validations/auth.validations.js";

const router = Router();

router.post("/register", validateSchema(registerValidation), register);
router.post("/login", validateSchema(loginValidation), login);
router.post("/verify-2fa", validateSchema(verify2FAValidation), verify2FA);

export default router;
