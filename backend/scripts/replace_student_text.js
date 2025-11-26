const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../frontend/OSP');

function walk(dir, callback) {
    fs.readdir(dir, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            const filepath = path.join(dir, file);
            fs.stat(filepath, function (err, stats) {
                if (stats.isDirectory()) {
                    walk(filepath, callback);
                } else if (stats.isFile()) {
                    callback(filepath);
                }
            });
        });
    });
}

function replaceContent(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    if (ext !== '.html' && ext !== '.js') return; // Only target HTML and JS files for now

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading ${filepath}:`, err);
            return;
        }

        let newData = data;
        
        // Replace "Students" with "Nữ tu" (Global, Case Insensitive)
        newData = newData.replace(/Students/g, 'Nữ tu');
        newData = newData.replace(/students/g, 'Nữ tu'); // Lowercase check
        
        // Replace "Student" with "Nữ tu"
        newData = newData.replace(/Student/g, 'Nữ tu');
        newData = newData.replace(/student/g, 'Nữ tu'); // Lowercase check

        // Fix some potential grammar issues from blind replace if needed, 
        // but "Nữ tu" works for both singular and plural in Vietnamese.

        if (newData !== data) {
            fs.writeFile(filepath, newData, 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing ${filepath}:`, err);
                } else {
                    console.log(`Updated: ${filepath}`);
                }
            });
        }
    });
}

console.log(`Scanning ${directoryPath} for text replacement...`);
walk(directoryPath, replaceContent);
