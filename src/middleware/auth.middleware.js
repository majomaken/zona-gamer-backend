import { ObjectId } from "mongodb";
import { ERRORS } from "../constants/global.constants.js";
import users from "../model/users.model.js";
import { extractTokenFromHeader, verifyAccessToken } from "../services/jwt.service.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No se proporcionó un token de autenticación",
        error: ERRORS.UNAUTHORIZED
      })
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: tokenError.message,
        error: ERRORS.INVALID_TOKEN
      })
    }

    const usersCollection = await users();
    console.log("decoded", decoded);
    console.log("decoded.userId", decoded.userId);

    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0, twoFactorCode: 0, twoFactorExpires: 0 } }
    );
    console.log("user", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
        error: ERRORS.USER_NOT_FOUND
      })
    }
    
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Usuario no verificado. Complete el proceso de autenticación.",
        error: ERRORS.USER_NOT_VERIFIED
      })
    }

    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error("Error en requireAuth:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: ERRORS.INTERNAL_ERROR
    })
  }
}