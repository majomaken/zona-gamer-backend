import nodemailer from "nodemailer";
import { getWelcomeEmailContent } from "../utils/email.templates.js";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });
}

export const sendWelcomeEmail = async (email, userName) => {
  const transporter = createTransporter();

  const subject = "¡Bienvenido a Zona Gamer!";
  const htmlContent = getWelcomeEmailContent(userName);
  const textContent = `
    ¡Bienvenido a Zona Gamer, ${userName}!

    Nos alegra mucho tenerte como parte de nuestra comunidad gaming. 
    Tu cuenta ha sido creada exitosamente.

    Para comenzar a disfrutar de todas las funcionalidades, asegúrate de:
    - Completar tu perfil
    - Explorar nuestro catálogo de juegos
    - Conectar con otros jugadores

    ¡Que disfrutes tu experiencia en Zona Gamer!

    Zona Gamer - Tu comunidad gaming
  `.trim();

  const message = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject,
    text: textContent,
    html: htmlContent,
  }

  const info = await transporter.sendMail(message);

  console.log("Email de bienvenida enviado:", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
