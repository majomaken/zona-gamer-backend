import jwt from 'jsonwebtoken';

/** 
 * Genera un token JWT de acceso con información del usuario
 * @param {Object} payload -- Datos del usuario a incluir en el token
 * @param {string} payload.userId -- ID del usuario
 * @param {string} payload.email -- Email del usuario
 * @param {string} payload.name -- Nombre del usuario
 * @returns {string} -- Token JWT firmado
*/
export const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      issuer: 'zona-gamer-api',
      audience: 'zona-gamer-users',
    }
  )
}

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '1d',
      issuer: 'zona-gamer-api',
      audience: 'zona-gamer-users',
    }
  )
}

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'zona-gamer-api',
      audience: 'zona-gamer-users',
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    } else {
      throw new Error('Error al verificar el token');
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