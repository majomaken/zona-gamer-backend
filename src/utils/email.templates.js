export const getWelcomeEmailContent = (userName) => {
  return `
    <h2>¡Bienvenido a Zona Gamer, ${userName}!</h2>
    <p>Nos alegra mucho tenerte como parte de nuestra comunidad gaming. Tu cuenta ha sido creada exitosamente.</p>
    
    <div style="background: #e8f4fd; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <h3 style="color: #007bff; margin-top: 0;">🎮 ¡Tu aventura gaming comienza aquí!</h3>
        <p>Explora, juega y conecta con otros gamers en nuestra plataforma.</p>
    </div>
    
    <p>Para comenzar a disfrutar de todas las funcionalidades, asegúrate de:</p>
    <ul>
        <li>✅ Completar tu perfil</li>
        <li>✅ Explorar nuestro catálogo de juegos</li>
        <li>✅ Conectar con otros jugadores</li>
    </ul>
    
    <p>Si tienes alguna pregunta, nuestro equipo de soporte está aquí para ayudarte.</p>
    <p>¡Que disfrutes tu experiencia en Zona Gamer!</p>
  `
}
