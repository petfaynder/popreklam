const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve('.');
const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'public', '.next'];
const includeExts = ['.js', '.jsx', '.ts', '.tsx'];

const turkishRegex = new RegExp('[ğüşöçıİĞÜŞÖÇ]', 'i');
let filesWithTurkish = [];

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                walkDir(fullPath);
            }
        } else {
            const ext = path.extname(file);
            if (includeExts.includes(ext)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (turkishRegex.test(content)) {
                        filesWithTurkish.push(fullPath.replace(projectRoot, ''));
                    }
                } catch(e){}
            }
        }
    }
}

walkDir(projectRoot);
fs.writeFileSync('files_with_turkish.json', JSON.stringify(filesWithTurkish, null, 2), 'utf8');
console.log('Found ' + filesWithTurkish.length + ' files.');