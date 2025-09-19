import { getDB } from '../db.js';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '../services/email.service.js';

export const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

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
      lockUntil: null,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (role === 'admin') {
      newUser.canAccessAdminPanel = true;
    }

    if (role === 'editor') {
      newUser.canEditPosts = true;
    }

    const result = await usersCollection.insertOne(newUser);

    const userResponse = {
      _id: result.insertedId,
      name: newUser.name,
      email: newUser.email,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
    }

    try {
      await sendWelcomeEmail(email, userResponse.name);
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
      error: "SERVER_ERROR"
    });
  }
}

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        error: "INVALID_CREDENTIALS"
      })
    }

  } catch (error) {
    console.error("Failed to login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: "SERVER_ERROR"
    });
  }
}