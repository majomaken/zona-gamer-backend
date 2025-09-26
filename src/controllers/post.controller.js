import { ERRORS } from "../constants/global.constants.js";
import { createPost } from "../services/post.service.js";

export const createPostController = async (req, res) => {
  const postData = req.body;
  const userId = req.userId;

  try {
    const newPost = await createPost(postData, userId);

    res.status(201).json({
      success: true,
      message: "Post creado correctamente",
      data: {
        post: newPost,
      }
    });

  } catch (error) {
    console.error("Failed to create post:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: ERRORS.INTERNAL_ERROR
    });
  }
}