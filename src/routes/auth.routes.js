import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { loginValidation, registerValidation } from "../validations/auth.validations.js";

const router = Router();

router.post("/register", validateSchema(registerValidation), register);
router.post("/login", validateSchema(loginValidation), login);

export default router;
