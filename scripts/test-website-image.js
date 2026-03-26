// 测试特定SKU的图片路径生成
import { getProductImage } from '../src/data/imageLoader.js';

const testSKU = 'BSD-HC-PCR-0P1ML-001';

console.log('\n========================================');
console.log('🧪 测试图片路径生成');
console.log('========================================\n');

const mainImage = getProductImage(testSKU, 'PCR板', 'main');
const compressedImage = getProductImage(testSKU, 'PCR板', 'compressed');
const thumbImage = getProductImage(testSKU, 'PCR板', 'thumb');

console.log(`SKU: ${testSKU}`);
console.log(`\n主图路径: ${mainImage}`);
console.log(`压缩图: ${compressedImage}`);
console.log(`缩略图: ${thumbImage}`);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查文件是否存在
const publicDir = path.join(__dirname, '../public');
const mainPath = path.join(publicDir, mainImage);
const exists = fs.existsSync(mainPath);

console.log(`\n文件是否存在: ${exists ? '✅' : '❌'}`);
if (exists) {
  const stats = fs.statSync(mainPath);
  console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
}

console.log('\n========================================\n');
