import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取映射表
const map = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/product-image-map.json'), 'utf8')
);

// 检查所有图片文件是否存在
const productsDir = path.join(__dirname, '../public/images/products');
const missingImages = [];

let count = 0;
Object.entries(map).forEach(([sku, info]) => {
  if (count >= 20) return; // 只检查前20个

  const imagePath = path.join(productsDir, info.image);
  if (!info.image.includes('default.svg') && !fs.existsSync(imagePath)) {
    missingImages.push({
      sku,
      image: info.image,
      matchType: info.matchType
    });
  }
  count++;
});

console.log('图片文件检查:');
if (missingImages.length > 0) {
  console.log('⚠️  缺失的图片:');
  missingImages.forEach(m => {
    console.log(`  ${m.sku} -> ${m.image}`);
  });
} else {
  console.log('✅ 所有图片文件都存在');
}

// 检查几个示例
console.log('\n示例检查:');
const examples = ['BSD-HC-PCR-0P1ML-001', 'BSD-HC-TIP-10UL-001', 'BSD-HC-TIP-20UL-001'];
examples.forEach(sku => {
  const info = map[sku];
  if (info) {
    const exists = fs.existsSync(path.join(productsDir, info.image));
    console.log(`  ${sku}: ${exists ? '✅' : '❌'} ${info.image.substring(0, 40)}`);
  }
});
