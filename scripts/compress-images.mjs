import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

const imagesToCompress = [
  {
    input: 'urara/assets/guide-to-tech/mac_committee_2023.png',
    output: 'urara/assets/guide-to-tech/mac_committee_2023.webp',
    maxWidth: 1200,
    quality: 85
  },
  {
    input: 'urara/assets/sai_red.png',
    output: 'urara/assets/sai_red.webp',
    maxWidth: 400,
    quality: 90
  },
  {
    input: 'urara/assets/neochomp/blog-1/newgenesis.png',
    output: 'urara/assets/neochomp/blog-1/newgenesis.webp',
    maxWidth: 1000,
    quality: 85
  },
  {
    input: 'urara/assets/neochomp/blog-1/teardown.png',
    output: 'urara/assets/neochomp/blog-1/teardown.webp',
    maxWidth: 1000,
    quality: 85
  }
];

async function compressImage(config) {
  const inputPath = join(root, config.input);
  const outputPath = join(root, config.output);
  
  console.log(`Compressing ${config.input}...`);
  
  try {
    await sharp(inputPath)
      .resize({ width: config.maxWidth, withoutEnlargement: true })
      .webp({ quality: config.quality })
      .toFile(outputPath);
    
    const { size: inputSize } = await sharp(inputPath).metadata();
    const { size: outputSize } = await sharp(outputPath).metadata();
    const savedMB = ((inputSize - outputSize) / 1024 / 1024).toFixed(2);
    const compressionPercent = (((inputSize - outputSize) / inputSize) * 100).toFixed(1);
    
    console.log(`✓ ${config.output} - Saved ${savedMB} MB (${compressionPercent}% reduction)`);
  } catch (error) {
    console.error(`✗ Failed to compress ${config.input}:`, error.message);
  }
}

async function main() {
  console.log('Starting image compression...\n');
  
  for (const config of imagesToCompress) {
    await compressImage(config);
  }
  
  console.log('\n✓ Image compression complete!');
}

main();


