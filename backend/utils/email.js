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


const sendOrderReadyEmail = async (toEmail, orderId) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: "¡Tu pedido está listo para recoger!",
        html: `
            <h1>¡Tu pedido está listo!</h1>
            <p>Hola,</p>
            <p>Te informamos que tu pedido con el número <strong>#${orderId}</strong> ya está listo para ser recogido en la cafetería.</p>
            <p>¡Gracias por tu compra!</p>
            <br>
            <p>Atentamente,<br>Coffee Andy</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de pedido listo enviado a ${toEmail} para el pedido #${orderId}');
    } catch (error) {
        // Solo registramos el error, no queremos que esto detenga la operación principal
        console.error('Error al enviar correo de pedido listo:', error);
    }
};


module.exports = {sendVerificationEmail,
                    sendOrderReadyEmail}