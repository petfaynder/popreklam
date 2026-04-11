import axios from 'axios';
import { getSetting } from '../controllers/admin-settings.controller.js';
import { logger } from '../utils/logger.js';

export const verifyRecaptcha = async (req, res, next) => {
    try {
        // Fetch Secret Key from DB
        const recaptchaSecret = await getSetting('recaptcha_secret_key', '');

        // If the admin hasn't set up ReCaptcha, act gracefully and bypass
        if (!recaptchaSecret || recaptchaSecret.trim() === '') {
            return next();
        }

        const recaptchaToken = req.body.recaptchaToken;

        if (!recaptchaToken) {
            return res.status(400).json({ error: 'Please complete the reCAPTCHA challenge.' });
        }

        // Send validation request to Google
        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`;
        const response = await axios.post(googleVerifyUrl);
        const { success, score } = response.data;

        // Note: For v3, you could check `score > 0.5`. But generic v2 just checks `success`
        if (!success) {
            logger.warn(`Failed ReCAPTCHA challenge: ${req.ip}`);
            return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
        }

        next();
    } catch (error) {
        logger.error('reCAPTCHA Middleware Error', error);
        // Failsafe open so legitimate users aren't locked out if Google API fails
        next();
    }
};
