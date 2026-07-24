const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const file_path = path.join(dir, file);
        const stat = fs.statSync(file_path);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file_path));
        } else if (file_path.endsWith('.js') || file_path.endsWith('.jsx')) {
            results.push(file_path);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
let replaced = 0;

files.forEach(f => {
    if (f.includes('i18n/navigation.js') || f.includes('i18n\\\\navigation.js')) return;
    
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes("import Link from 'next/link'") || content.includes('import Link from "next/link"')) {
        content = content.replace(/import Link from ['"]next\/link['"];?/g, "import { Link } from '@/i18n/navigation';");
        fs.writeFileSync(f, content);
        replaced++;
        console.log(`Updated: ${f}`);
    }
});

console.log('Replaced next/link in ' + replaced + ' files.');
