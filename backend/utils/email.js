const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

const sendVerificationEmail = async (toEmail, token) => {
    const verificationUrl = `http://localhost:3001/api/auth/verify-email/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Verifica tu cuenta',
        html: `
            <h1>¡Bienvenido a Coffee Andy!</h1>
            <p>Por favor, haz clic en el siguiente enlace para verificar tu correo:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de verificación enviado a', toEmail);
    } catch (error) {
        console.error('Error al enviar correo:', error);
    }
};

module.exports = sendVerificationEmail;