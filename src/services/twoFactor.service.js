import crypto from 'crypto'

const EXPIRATION_MINUTES_DEFAULT = 10;

export const generate2FACode = () => {
  const code = crypto.randomInt(100000, 1000000);
  return code.toString();
}

export const get2FAExpirationTime = (minutesToExpire = EXPIRATION_MINUTES_DEFAULT) => {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + minutesToExpire)
  return expirationTime;
}

export const is2FACodeExpired = (expirationTime) => {
  const now = new Date();
  return now > expirationTime;
}

export const verify2FACode = (inputCode, storedCode, expirationTime) => {
  // Verificar si el código ha expirado
  if (is2FACodeExpired(expirationTime)) {
    return {
      isValid: false,
      error: "EXPIRED",
      message: "El código de verificación ha expirado"
    }
  }

  // Verificar si el código es correcto
  if (inputCode !== storedCode) {
    return {
      isValid: false,
      error: "INVALID_CODE",
      message: "El código de verificación es incorrecto"
    }
  }

  return {
    isValid: true,
    message: 'Código de verificación válido'
  }
}
