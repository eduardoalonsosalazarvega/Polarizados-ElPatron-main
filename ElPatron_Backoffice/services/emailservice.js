const nodemailer = require('nodemailer');

// Configurar el transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "lavanderiaelpatron218@gmail.com",
        pass: "yksr xpuc cdsz rtix"
    }
});

async function sendEmailReminder(cita) {
    const fechaInicio = new Date(cita.fechaInicio);
    
    const fechaFormateada = fechaInicio.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const horaInicio = fechaInicio.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const mailOptions = {
        from: '"Sistema de Citas" <noreply@tuclinica.com>',
        to: cita.correo,
        subject: '🔔 Recordatorio de tu Cita',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .info-box { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #4CAF50; border-radius: 4px; }
                    .info-item { margin: 10px 0; }
                    .info-item strong { color: #4CAF50; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Recordatorio de Cita</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${cita.nombre}</strong>,</p>
                        <p>Te recordamos que tienes una cita programada:</p>
                        
                        <div class="info-box">
                            <div class="info-item">
                                <strong>📅 Fecha:</strong> ${fechaFormateada}
                            </div>
                            <div class="info-item">
                                <strong>🕐 Hora:</strong> ${horaInicio}
                            </div>
                        </div>
                        
                        <p>Por favor, procura llegar <strong>10 minutos antes</strong> de tu hora programada.</p>
                        
                        <p>Si necesitas cancelar o reprogramar tu cita, por favor contáctanos lo antes posible.</p>
                        
                        <p>¡Te esperamos!</p>
                        
                        <div class="footer">
                            <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado a ${cita.correo}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando email a ${cita.correo}:`, error);
        return false;
    }
}

module.exports = { sendEmailReminder };