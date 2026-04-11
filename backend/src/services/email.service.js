import nodemailer from 'nodemailer';
import { getSetting } from '../controllers/admin-settings.controller.js';
import { logger } from '../utils/logger.js';

/**
 * Creates a Nodemailer transporter dynamically using database settings
 */
const createTransporter = async () => {
    try {
        const host = await getSetting('smtp_host', '');
        const port = await getSetting('smtp_port', '587');
        const user = await getSetting('smtp_user', '');
        const pass = await getSetting('smtp_pass', '');

        if (!host || !user || !pass) {
            logger.warn('SMTP Settings are incomplete. Emails will not be sent.');
            return null;
        }

        return nodemailer.createTransport({
            host: host,
            port: parseInt(port, 10),
            secure: parseInt(port, 10) === 465, // true for 465, false for other ports
            auth: {
                user: user,
                pass: pass
            }
        });
    } catch (error) {
        logger.error('Failed to create SMTP transporter', error);
        return null;
    }
};

/**
 * Sends an email using the global platform settings
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body of the email
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = await createTransporter();
        if (!transporter) return false;

        const fromEmail = await getSetting('smtp_from_email', 'noreply@popreklam.com');
        const fromName = await getSetting('smtp_from_name', 'PopReklam');

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error('Email sending failed', error);
        return false;
    }
};
