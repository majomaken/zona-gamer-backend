import { getDB } from '../db.js';
import bcrypt from 'bcryptjs';
import { generate2FACode, get2FAExpirationTime, verify2FACode } from '../services/twoFactor.service.js';
import { sendByEmailJs, /*sendWelcomeEmail */ } from '../services/email.service.js';
import { generateAccessToken, generateRefreshToken } from '../services/jwt.service.js';
import { ERRORS } from '../constants/global.constants.js';
import users from '../model/users.model.js';

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const usersCollection = await users();

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ya existe uan cuenta con este email",
        error: "USER_ALREADY_EXISTS"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      twoFactorCode: null,
      twoFactorExpires: null,
      loginAttempts: 0,
      lockUntil: null, // Fecha y hora en que se bloquea la cuenta
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    const userResponse = {
      _id: result.insertedId,
      name: newUser.name,
      email: newUser.email,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
    }

    try {
      const templateId = process.env.EMAIL_JS_WELCOME_TEMPLATE_ID;
      // await sendWelcomeEmail(email, userResponse.name);
      const dataToSend = {
        user_name: userResponse.name,
      }
      await sendByEmailJs(email, dataToSend, templateId);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    res.status(201).json({ 
      success: true, 
      message: "Usuario creado correctamente", 
      data: userResponse
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: ERRORS.INTERNAL_ERROR
    });
  }
}

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const usersCollection = await users();

    const user = await usersCollection.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        error: "INVALID_CREDENTIALS"
      })
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockUntil - new Date()) / (1000 * 60));
      return res.status(423).json({
        success: false,
        message: `Cuenta bloqueada temporalmente. Intenta en ${remainingMinutes} minutos`,
        error: ERRORS.ACCOUNT_LOCKED
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const loginAttempts = (user.loginAttempts || 0) + 1;
      const updateData = {
        loginAttempts,
        updateAt: new Date(),
      };

      if (loginAttempts >= 3) {
        updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        updateData.loginAttempts = 0;
      }

      await usersCollection.updateOne({ _id: user._id }, { $set: updateData });

      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        error: ERRORS.INVALID_CREDENTIALS
      })
    }

    const twoFactorCode = generate2FACode();
    const twoFactorExpires = get2FAExpirationTime(10);

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          twoFactorCode,
          twoFactorExpires,
          loginAttempts: 0,
          lockUntil: null,
          updateAt: new Date(),
        }
      }
    );

    try {
      const templateId = process.env.EMAIL_JS_LOGIN_TEMPLATE_ID;
      const dataToSend = {
        userName: user.name,
        code: twoFactorCode,
      }
      console.log("user.email", user.email);
      console.log("dataToSend", dataToSend);
      await sendByEmailJs(user.email, dataToSend, templateId);
    } catch (error) {
      console.error("Failed to send 2FA email:", error);
      return res.status(500).json({
        success: false,
        message: "Error enviando código de verificación",
        error: ERRORS.EMAIL_SEND_ERROR
      })
    }

    res.status(200).json({
      success: true,
      message: "Código de verificación enviado a tu email",
      data: {
        email: user.email,
        codeExpires: 10,
      }
    })

  } catch (error) {
    console.error("Failed to login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: "SERVER_ERROR"
    });
  }
}

export const verify2FA = async (req, res, next) => {
  const { email, code } = req.body;

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        error: "USER_NOT_FOUND"
      })
    }

    if (!user.twoFactorCode || !user.twoFactorExpires) {
      return res.status(400).json({
        success: false,
        message: "No hay código de verificación pendiente",
        error: "NO_PENDING_CODE"
      })
    }

    const validation = verify2FACode(
      code,
      user.twoFactorCode,
      user.twoFactorExpires
    )

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        error: validation.error
      })
    }

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date()
        },
        $unset: {
          twoFactorCode: "",
          twoFactorExpires: "",
        }
      }
    )

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      name: user.name,
    }

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }

    res.status(200).json({
      success: true,
      message: "Autenticación completada exitosamente",
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
          tokenType: 'Bearer',
          expiresIn: process.env.JWT_EXPIRES_IN ?? '15m'
        }
      }
    })

  } catch (error) {
    console.error("Failed to verify 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: "INTERNAL_ERROR"
    })
  }
}