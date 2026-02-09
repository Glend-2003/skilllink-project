const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


transporter.use('compile', hbs({
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve('./src/templates'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./src/templates'),
    extName: '.hbs',
}));

const sendEmail = async (to, subject, template, context) => {
    const mailOptions = {
        from: `"SkillLink Notifications" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        template,
        context, 
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo enviado a ${to}`);
    } catch (error) {
        console.error('Error enviando correo:', error);
    }
};

module.exports = { sendEmail };