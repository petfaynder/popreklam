const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');


const locales = ['tr', 'ru', 'pt', 'es', 'fr', 'id', 'ar', 'de'];

function getPathsAndValues(obj, prefix = '') {
    let result = [];
    for (const key in obj) {
        if (key === 'brutalist') continue; // We already translated this
        
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'string') {
            result.push({ path: newPrefix, value: obj[key] });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            result = result.concat(getPathsAndValues(obj[key], newPrefix));
        }
    }
    return result;
}

function setValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

async function main() {
    const enPath = path.join(__dirname, 'messages', 'en.json');
    const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    
    const items = getPathsAndValues(enJson);
    console.log(`Found ${items.length} strings to translate.`);

    for (const lang of locales) {
        console.log(`\n🌍 Translating to ${lang}...`);
        const targetPath = path.join(__dirname, 'messages', `${lang}.json`);
        let langJson = {};
        if (fs.existsSync(targetPath)) {
            langJson = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        }

        // Chunk items to respect Google Translate limits (approx 5000 chars)
        let currentChunk = [];
        let currentLen = 0;
        const chunks = [];

        for (const item of items) {
            // we use <div id="path">value</div>
            const htmlStr = `<div id="${item.path}">${item.value}</div>`;
            if (currentLen + htmlStr.length > 3000) {
                chunks.push(currentChunk);
                currentChunk = [];
                currentLen = 0;
            }
            currentChunk.push(item);
            currentLen += htmlStr.length;
        }
        if (currentChunk.length > 0) chunks.push(currentChunk);

        console.log(`Created ${chunks.length} chunks for ${lang}`);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const htmlPayload = chunk.map(item => `<div id="${item.path}">${item.value}</div>`).join('\n');
            
            try {
                const res = await translate(htmlPayload, { to: lang, format: 'html' });
                
                // Parse the returned HTML. Simple regex since format is predictable
                const regex = /<div id="([^"]+)">([\s\S]*?)<\/div>/g;
                let match;
                while ((match = regex.exec(res.text)) !== null) {
                    const path = match[1];
                    const val = match[2].trim();
                    setValue(langJson, path, val);
                }
                
                console.log(`  - Chunk ${i+1}/${chunks.length} translated.`);
                await new Promise(r => setTimeout(r, 4000)); // 4s delay between chunks
            } catch (err) {
                console.error(`  - Error on chunk ${i+1}: ${err.message}`);
            }
        }

        fs.writeFileSync(targetPath, JSON.stringify(langJson, null, 2));
        console.log(`✅ Saved ${lang}.json`);
    }
}

main();
