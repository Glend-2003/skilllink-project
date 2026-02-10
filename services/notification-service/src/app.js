const express = require('express');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const { sendEmail } = require('./utils/mailer');
require('dotenv').config();

const app = express();
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || 'skilllink_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'skilllink_db'
};

// Configure email transporter for send-email endpoint
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email template for password reset
const getPasswordResetEmailTemplate = (code) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperar Contraseña - SkillLink</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">SkillLink</h1>
                  <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 14px;">Conecta con los mejores profesionales</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Recuperar Contraseña</h2>
                  <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                    Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código de verificación para continuar:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb;">
                        <span style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${code}</span>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
                    Este código expirará en <strong>15 minutos</strong>.
                  </p>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                    Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    © 2026 SkillLink. Todos los derechos reservados.
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                    Este es un correo automático, por favor no respondas a este mensaje.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

app.post('/api/notifications/send', async (req, res) => {
    const { userId, userEmail, type, title, message, entityType, entityId } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [result] = await connection.execute(
            `INSERT INTO notifications (user_id, notification_type, title, message, related_entity_type, related_entity_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, type, title, message, entityType || null, entityId || null]
        );

        console.log(`[Notification] Preparando correo para: ${userEmail}`);

        if (userEmail) {
       
            await sendEmail(userEmail, title, 'notification', { title, message });
        }

        await connection.end();
        res.status(201).json({ 
            success: true, 
            message: 'Notificación registrada y en proceso de envío',
            notificationId: result.insertId 
        });
     } catch (error) {
        console.error('Error en Notification Service:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send email endpoint
app.post('/api/notifications/send-email', async (req, res) => {
  try {
    const { to, subject, code, type, html } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject'
      });
    }

    // Must have either code or html
    if (!code && !html) {
      return res.status(400).json({
        success: false,
        error: 'Either code or html must be provided'
      });
    }

    // Check if SMTP is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`📧 Email would be sent to ${to}`);
      if (code) console.log(`   Code: ${code}`);
      console.log('⚠️  SMTP not configured - email logged instead');
      
      return res.json({
        success: true,
        message: 'Email service not configured - email logged',
        code: process.env.NODE_ENV === 'development' ? code : undefined
      });
    }

    // Generate email HTML based on what's provided
    let emailHtml;
    if (html) {
      // Use provided HTML directly (for login, register, etc.)
      emailHtml = html;
    } else if (code && type === 'password-reset') {
      // Use password reset template
      emailHtml = getPasswordResetEmailTemplate(code);
    } else if (code) {
      // Simple code template
      emailHtml = `<p>Tu código de verificación es: <strong>${code}</strong></p>`;
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"SkillLink" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: emailHtml,
    });

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // In development, still return success
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Email details for ${req.body.to}:`);
      console.log(`   Subject: ${req.body.subject}`);
      if (req.body.code) console.log(`   Code: ${req.body.code}`);
      return res.json({
        success: true,
        message: 'Email service error - details logged',
        code: req.body.code
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to send email'
    });
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Notification Service corriendo en el puerto ${PORT}`);
});