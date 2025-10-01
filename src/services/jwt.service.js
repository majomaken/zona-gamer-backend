import jwt from 'jsonwebtoken';
import { JWT_REFRESH_SECRET, JWT_SECRET } from '../constants/global.constants.js';

/** 
 * Genera un token JWT de acceso con información del usuario
 * @param {Object} payload -- Datos del usuario a incluir en el token
 * @param {string} payload.userId -- ID del usuario
 * @param {string} payload.email -- Email del usuario
 * @param {string} payload.name -- Nombre del usuario
 * @returns {string} -- Token JWT firmado
*/
export const generateAccessToken = (payload) => {
  const token = jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      issuer: 'zona-gamer-api',
      audience: 'zona-gamer-users',
    }
  )

  return token;
}

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    { userId: payload.userId },
    JWT_REFRESH_SECRET || JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '1d',
      issuer: 'zona-gamer-api',
      audience: 'zona-gamer-users',
    }
  )
}


export const verifyAccessToken = (token) => {
  const bodyToken = {
    issuer: 'zona-gamer-api',
    audience: 'zona-gamer-users',
  }

  try {
    return jwt.verify(token, JWT_SECRET, bodyToken);
  } catch (accessTokenError) {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET, bodyToken);
    } catch (refreshTokenError) {
      if (accessTokenError.name === 'TokenExpiredError' || refreshTokenError.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (accessTokenError.name === 'JsonWebTokenError' || refreshTokenError.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      } else {
        throw new Error('Error al verificar token');
      }
    }
  }
}

export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // return authHeader.substring(7); // Remueve el prefijo 'Bearer '
  return authHeader.split(' ')[1]; // ['Bearer', 'sdfjksdhfkjaskdfjhsdkjfh']
}