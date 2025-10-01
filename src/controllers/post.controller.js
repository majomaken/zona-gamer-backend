import { ERRORS } from "../constants/global.constants.js";
import { createPost, getPostById, getPosts } from "../services/post.service.js";
import { getPostsQueryValidation, postIdValidation } from "../validations/post.validations.js";

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
      },
    });
  } catch (error) {
    console.error("Failed to create post:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: ERRORS.INTERNAL_ERROR,
    });
  }
};

export const getPostController = async (req, res) => {
  try {
    const validationResult = postIdValidation.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "ID del post inválido",
        errors: validationResult.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code
        }))
      })
    }
    const { id } = validationResult.data;
    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post no encontrado",
        error: ERRORS.POST_NOT_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      message: "Post obtenido correctamente",
      data: {
        post,
      },
    });

  } catch (error) {
    console.error("Failed to get post:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: ERRORS.INTERNAL_ERROR,
    });
  }
}

export const getPostsController = async (req, res) => {
  try {
    const validationResult = getPostsQueryValidation.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Parámetros de consulta inválidos",
        errors: validationResult.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code
        }))
      })
    }

    const filters = validationResult.data;
    const results = await getPosts(filters);

    res.status(200).json({
      success: true,
      message: "Posts obtenidos correctamente",
      data: {
        posts: results.posts,
        pagination: results.pagination,
      },
    });
  } catch (error) {
    console.error("Error obteniendo posts", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: ERRORS.INTERNAL_ERROR,
    });
  }
};
