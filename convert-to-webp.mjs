import sharp from 'sharp';
import path from 'path';

const inputFile = process.argv[2] || 'data/nexus_gaming_hub/imgs/template.png';
const outputFile = process.argv[3] || 'data/nexus_gaming_hub/imgs/template.webp';

(async () => {
  try {
    await sharp(inputFile)
      .webp({ quality: 80 })
      .toFile(outputFile);
    console.log(`✓ Converted ${inputFile} to ${outputFile}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
