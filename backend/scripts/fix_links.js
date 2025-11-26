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

function fixLinks(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    if (ext !== '.html' && ext !== '.js') return;

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading ${filepath}:`, err);
            return;
        }

        let newData = data;
        
        // Revert broken filenames in hrefs
        newData = newData.replace(/all-Nữ tu\.html/g, 'all-student.html');
        newData = newData.replace(/Nữ tu-details\.html/g, 'student-details.html');
        newData = newData.replace(/Nữ tu-promotion\.html/g, 'student-promotion.html');
        newData = newData.replace(/Nữ tu-attendence\.html/g, 'student-attendence.html');
        newData = newData.replace(/add-Nữ tu\.html/g, 'add-student.html'); // Just in case

        if (newData !== data) {
            fs.writeFile(filepath, newData, 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing ${filepath}:`, err);
                } else {
                    console.log(`Fixed links in: ${filepath}`);
                }
            });
        }
    });
}

console.log(`Fixing broken links in ${directoryPath}...`);
walk(directoryPath, fixLinks);
