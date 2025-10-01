import { Router } from "express";
import { createPostController, getPostController, getPostsController } from "../controllers/post.controller.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { createPostValidation } from "../validations/post.validations.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/', requireAuth, validateSchema(createPostValidation), createPostController)

router.get('/:id', getPostController)

router.get('/', getPostsController);

export default router;