const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve('c:/Users/Tolga/Desktop/Proje Siteleri/popreklam');
const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'public', '.next'];
const includeExts = ['.js', '.jsx', '.ts', '.tsx', '.json'];
const turkishRegex = /[ğüşıöçĞÜŞİÖÇ]/;

let results = [];

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
                const content = fs.readFileSync(fullPath, 'utf8');
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (turkishRegex.test(line)) {
                        results.push({
                            file: fullPath.replace(projectRoot, ''),
                            line: index + 1,
                            text: line.trim()
                        });
                    }
                });
            }
        }
    }
}

walkDir(projectRoot);
fs.writeFileSync(path.join(projectRoot, 'turkish_results.json'), JSON.stringify(results, null, 2));
console.log('Found ' + results.length + ' lines with Turkish characters.');
