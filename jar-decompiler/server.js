const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static('public'));

// Decompile endpoint
app.post('/decompile', upload.single('jarFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const jarPath = req.file.path;
    const outputDir = path.join(__dirname, 'decompiled', path.basename(jarPath, '.jar'));

    try {
        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Extract JAR file
        const zip = new AdmZip(jarPath);
        zip.extractAllTo(outputDir, true);

        // Decompile using CFR (you would need to install CFR decompiler)
        const cfrPath = path.join(__dirname, 'cfr-0.152.jar'); // Download CFR and place it here
        const decompileCommand = `java -jar ${cfrPath} ${outputDir} --outputdir ${outputDir}/decompiled`;

        exec(decompileCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Decompilation error:', error);
                return res.status(500).json({ error: 'Decompilation failed' });
            }

            // Read decompiled files
            const decompiledFiles = [];
            const decompiledDir = path.join(outputDir, 'decompiled');
            
            if (fs.existsSync(decompiledDir)) {
                const files = fs.readdirSync(decompiledDir);
                files.forEach(file => {
                    if (file.endsWith('.java')) {
                        const filePath = path.join(decompiledDir, file);
                        const content = fs.readFileSync(filePath, 'utf-8');
                        decompiledFiles.push({
                            name: file,
                            code: content
                        });
                    }
                });
            }

            // Clean up
            fs.rmSync(outputDir, { recursive: true, force: true });
            fs.unlinkSync(jarPath);

            res.json({ classes: decompiledFiles });
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
