import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

const inputPath = join(root, 'src/styles/images/pokesprite-pokemon-gen8.png');
const outputPath = join(root, 'src/styles/images/pokesprite-pokemon-gen8.webp');

console.log('Converting Pokemon sprite sheet to WebP...');
console.log(`Input: ${inputPath}`);
console.log(`Output: ${outputPath}`);

try {
  const inputStats = await sharp(inputPath).metadata();
  console.log(`\nOriginal PNG: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB`);
  
  await sharp(inputPath)
    .webp({ quality: 90, effort: 6 })
    .toFile(outputPath);
  
  const outputStats = await sharp(outputPath).metadata();
  const savedMB = ((inputStats.size - outputStats.size) / 1024 / 1024).toFixed(2);
  const compressionPercent = (((inputStats.size - outputStats.size) / inputStats.size) * 100).toFixed(1);
  
  console.log(`Converted WebP: ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`✓ Saved ${savedMB} MB (${compressionPercent}% reduction)`);
} catch (error) {
  console.error(`✗ Failed to convert:`, error.message);
  process.exit(1);
}

