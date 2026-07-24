const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

const locales = ['tr', 'ru', 'es', 'fr', 'pt', 'de', 'id', 'ar'];

// Recursive function to find missing keys and translate them
async function syncObject(enObj, targetObj, langCode, pathString = '') {
    let updated = false;
    for (const key in enObj) {
        if (typeof enObj[key] === 'object' && enObj[key] !== null) {
            if (!targetObj[key]) {
                targetObj[key] = {};
            }
            const childUpdated = await syncObject(enObj[key], targetObj[key], langCode, pathString ? `${pathString}.${key}` : key);
            if (childUpdated) updated = true;
        } else if (typeof enObj[key] === 'string') {
            if (!targetObj[key]) {
                // Key is missing! Let's translate it.
                try {
                    console.log(`Translating [${langCode}] ${pathString ? pathString + '.' + key : key} ...`);
                    // Note: Handle placeholders like {name} manually if needed, or let Google translate handle it.
                    // Usually Google preserves {foo} somewhat, but let's be careful.
                    const res = await translate(enObj[key], { to: langCode });
                    targetObj[key] = res.text;
                    updated = true;
                } catch (err) {
                    console.error(`Failed to translate ${key} to ${langCode}:`, err.message);
                }
            }
        }
    }
    return updated;
}

async function main() {
    const enPath = path.join(__dirname, 'messages', 'en.json');
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    for (const locale of locales) {
        const localePath = path.join(__dirname, 'messages', `${locale}.json`);
        let localeData = {};
        if (fs.existsSync(localePath)) {
            localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
        }

        console.log(`\nSyncing ${locale}...`);
        const updated = await syncObject(enData, localeData, locale);

        if (updated) {
            fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2));
            console.log(`✅ Saved ${locale}.json`);
        } else {
            console.log(`👍 ${locale}.json is up to date.`);
        }
    }
    console.log('\nAll syncs complete!');
}

main().catch(console.error);
