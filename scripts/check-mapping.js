import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const map = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/product-image-map.json'), 'utf8')
);

const skus = Object.keys(map);
const hasImage = skus.filter(s => map[s].matchType !== 'default' && !map[s].image.includes('default.svg'));
const exact = skus.filter(s => map[s].matchType === 'exact');
const keyword = skus.filter(s => map[s].matchType === 'keyword');
const category = skus.filter(s => map[s].matchType === 'category');
const generic = skus.filter(s => map[s].matchType === 'generic');

console.log('总SKU:', skus.length);
console.log('有图片产品:', hasImage.length);
console.log('  - 精确匹配:', exact.length);
console.log('  - 关键词匹配:', keyword.length);
console.log('  - 类别匹配:', category.length);
console.log('  - 通用图片:', generic.length);
console.log('默认图片:', skus.length - hasImage.length);

// 检查特定SKU
const targetSku = 'BSD-HC-PCR-0P1ML-001';
if (map[targetSku]) {
  console.log('\n目标SKU映射:');
  console.log(JSON.stringify(map[targetSku], null, 2));
}

// 检查前5个真实图片
console.log('\n前5个真实图片:');
hasImage.slice(0, 5).forEach(sku => {
  console.log(`  ${sku} -> ${map[sku].image.substring(0, 50)} (${map[sku].matchType})`);
});
