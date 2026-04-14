import webpush from 'web-push';
import prisma from '../lib/prisma.js';


/**
 * VAPID Key Management
 * Keys are generated once and stored in SystemSettings.
 * Re-generating keys invalidates ALL existing push subscriptions.
 */
export const getVapidKeys = async () => {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ['vapid_public_key', 'vapid_private_key'] } }
    });

    const publicKeyRecord = settings.find(s => s.key === 'vapid_public_key');
    const privateKeyRecord = settings.find(s => s.key === 'vapid_private_key');

    if (publicKeyRecord?.value && privateKeyRecord?.value) {
        return {
            publicKey: publicKeyRecord.value,
            privateKey: privateKeyRecord.value
        };
    }

    // Auto-generate on first run
    console.log('🔑 Generating new VAPID key pair...');
    const keys = webpush.generateVAPIDKeys();

    await prisma.systemSetting.upsert({
        where: { key: 'vapid_public_key' },
        create: { key: 'vapid_public_key', value: keys.publicKey, group: 'push_notifications', label: 'VAPID Public Key', type: 'string' },
        update: { value: keys.publicKey }
    });

    await prisma.systemSetting.upsert({
        where: { key: 'vapid_private_key' },
        create: { key: 'vapid_private_key', value: keys.privateKey, group: 'push_notifications', label: 'VAPID Private Key', type: 'string' },
        update: { value: keys.privateKey }
    });

    console.log('✅ VAPID keys generated and saved.');
    return keys;
};

export const initWebPush = async () => {
    try {
        const { publicKey, privateKey } = await getVapidKeys();
        const email = process.env.VAPID_EMAIL || 'mailto:admin@mrpop.io';

        webpush.setVapidDetails(email, publicKey, privateKey);
        console.log('🔔 Web Push initialized with VAPID keys.');
        return publicKey;
    } catch (err) {
        console.error('❌ Web Push initialization failed:', err.message);
    }
};

export const getVapidPublicKey = async () => {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'vapid_public_key' }
    });
    return setting?.value || null;
};
