import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n========================================');
console.log('🧪 测试图片路径处理');
console.log('========================================\n');

// 读取映射表
const map = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/product-image-map.json'), 'utf8')
);

const targetSKU = 'BSD-HC-PCR-0P1ML-001';
const mapping = map[targetSKU];

console.log(`SKU: ${targetSKU}`);
console.log(`映射信息: ${JSON.stringify(mapping, null, 2)}\n`);

// 模拟imageLoader.js的逻辑
function getProductImage(sku, category = '') {
  const mapping = map[sku];
  if (mapping && mapping.image && !mapping.image.includes('default')) {
    const baseName = mapping.image.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    return `/images/products/${baseName}.jpg`;
  }
  return '/images/products/default-product.svg';
}

// 生成路径
const imageUrl = getProductImage(targetSKU, 'PCR板');
console.log(`生成的URL: ${imageUrl}\n`);

// 验证路径是否正确
const actualFile = mapping.image;
console.log(`实际文件名: ${actualFile}`);
console.log(`基础文件名: ${actualFile.replace(/\.(jpg|jpeg|png|webp)$/i, '')}`);

// 检查文件是否存在
const publicDir = path.join(__dirname, '../public');
const imagePath = path.join(publicDir, imageUrl);

console.log(`\n完整路径: ${imagePath}`);
console.log(`文件存在: ${fs.existsSync(imagePath) ? '✅' : '❌'}`);

if (fs.existsSync(imagePath)) {
  const stats = fs.statSync(imagePath);
  console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`是否为文件: ${stats.isFile() ? '✅' : '❌'}`);
}

console.log('\n========================================\n');

// 测试其他SKU
console.log('测试其他SKU:\n');
const otherSKUs = ['BSD-HC-TIP-10UL-001', 'BSD-HC-TIP-20UL-001', 'BSD-HC-TIP-50UL-001'];

otherSKUs.forEach(sku => {
  const mapping = map[sku];
  const url = getProductImage(sku, mapping.category);
  const exists = fs.existsSync(path.join(publicDir, url));

  console.log(`${sku}:`);
  console.log(`  文件: ${mapping.image.substring(0, 40)}...`);
  console.log(`  URL: ${url}`);
  console.log(`  存在: ${exists ? '✅' : '❌'}\n`);
});
