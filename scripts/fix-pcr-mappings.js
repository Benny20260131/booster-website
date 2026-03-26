/**
 * 修复PCR板图片映射
 * 将无裙边PCR板SKU关联到正确的图片
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mapPath = path.join(__dirname, '../src/data/product-image-map.json');
const imageMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// PCR板图片映射修正
const pcrMappings = {
  // 0.1ml 无裙边
  'BSD-HC-PCR-0P1ML-001': '分子生物类_0.1mL无裙边96孔PCR板_5.jpg',
  'BSD-HC-PCR-0P1ML-002': '分子生物类_0.1mL无裙边96孔PCR板_5.jpg',
  
  // 0.1ml 半裙边
  'BSD-HC-PCR-0P1ML-003': '分子生物类_0.1mL半裙边96孔PCR板_9.jpg',
  'BSD-HC-PCR-0P1ML-004': '分子生物类_0.1mL半裙边96孔PCR板_9.jpg',
  
  // 0.1ml 高裙边
  'BSD-HC-PCR-0P1ML-005': '分子生物类_0.1mL高裙边96孔PCR板_15.jpg',
  'BSD-HC-PCR-0P1ML-006': '分子生物类_0.1mL高裙边96孔PCR板_15.jpg',
  
  // 0.2ml 无裙边
  'BSD-HC-PCR-0P2ML-001': '分子生物类_0.2mL无裙边96孔PCR板_7.jpg',
  'BSD-HC-PCR-0P2ML-002': '分子生物类_0.2mL无裙边96孔PCR板_7.jpg',
  
  // 0.2ml 半裙边
  'BSD-HC-PCR-0P2ML-003': '分子生物类_0.2mL半裙边96孔PCR板_11.jpg',
  'BSD-HC-PCR-0P2ML-004': '分子生物类_0.2mL半裙边96孔PCR板_11.jpg',
  
  // 0.2ml 高裙边
  'BSD-HC-PCR-0P2ML-005': '分子生物类_0.2mL高裙边96孔PCR板_17.jpg',
  'BSD-HC-PCR-0P2ML-006': '分子生物类_0.2mL高裙边96孔PCR板_17.jpg',
  
  // 0.2ml 宽裙边
  'BSD-HC-PCR-0P2ML-007': '分子生物类_0.2mL宽裙边96孔PCR板_13.jpg',
  'BSD-HC-PCR-0P2ML-008': '分子生物类_0.2mL宽裙边96孔PCR板_13.jpg',
};

console.log('\n========================================');
console.log('🔧 修复PCR板图片映射');
console.log('========================================\n');

let fixed = 0;

for (const [sku, imageFile] of Object.entries(pcrMappings)) {
  if (imageMap[sku]) {
    const oldImage = imageMap[sku].image;
    imageMap[sku].image = imageFile;
    imageMap[sku].matchType = 'exact';
    console.log(`✓ ${sku}`);
    console.log(`  ${oldImage} → ${imageFile}`);
    fixed++;
  }
}

// 保存修复后的映射表
fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2), 'utf8');

console.log('\n========================================');
console.log(`✅ 修复完成: ${fixed} 个SKU`);
console.log('========================================\n');
