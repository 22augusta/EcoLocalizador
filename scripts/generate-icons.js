const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generate(svgPath, outPath, size) {
    if (!fs.existsSync(svgPath)) {
        console.error('SVG not found:', svgPath);
        return;
    }

    try {
        const svgBuffer = fs.readFileSync(svgPath);
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(outPath);
        console.log('Generated', outPath);
    } catch (err) {
        console.error('Error generating', outPath, err);
    }
}

(async () => {
    const root = path.resolve(__dirname, '..');
    await generate(path.join(root, 'icon-192.svg'), path.join(root, 'icon-192.png'), 192);
    await generate(path.join(root, 'icon-512.svg'), path.join(root, 'icon-512.png'), 512);
})();
