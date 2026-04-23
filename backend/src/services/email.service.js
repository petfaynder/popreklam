import nodemailer from 'nodemailer';
import { getSetting } from '../controllers/admin-settings.controller.js';
import { logger } from '../utils/logger.js';

/**
 * Creates a Nodemailer transporter dynamically using database settings
 */
const createTransporter = async () => {
    try {
        const host = await getSetting('smtp_host', process.env.SMTP_HOST || '');
        const port = await getSetting('smtp_port', process.env.SMTP_PORT || '587');
        const user = await getSetting('smtp_user', process.env.SMTP_USER || '');
        const pass = await getSetting('smtp_pass', process.env.SMTP_PASS || '');

        if (!host) {
            logger.warn('SMTP host is not configured. Emails will not be sent.');
            return null;
        }

        const isLocalRelay = host === 'mailserver' || host === 'localhost' || host === '127.0.0.1';

        // Local Postfix relay: no auth needed
        if (isLocalRelay) {
            return nodemailer.createTransport({
                host,
                port: parseInt(port, 10),
                secure: false,
                ignoreTLS: true,
                auth: false,
            });
        }

        // External SMTP: requires credentials
        if (!user || !pass) {
            logger.warn('SMTP credentials are incomplete. Emails will not be sent.');
            return null;
        }

        return nodemailer.createTransport({
            host,
            port: parseInt(port, 10),
            secure: parseInt(port, 10) === 465,
            auth: { user, pass },
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

        const fromEmail = await getSetting('smtp_from_email', 'noreply@mrpop.io');
        const fromName = await getSetting('smtp_from_name', 'MrPop.io');

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
