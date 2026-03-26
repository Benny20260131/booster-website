import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mappingPath = path.join(__dirname, '../src/data/product-image-map.json');

console.log('🔍 检查映射表编码...\n');

// 读取原始内容
const rawContent = fs.readFileSync(mappingPath, 'utf8');
console.log('文件大小:', rawContent.length, '字节');

// 解析JSON
try {
  const map = JSON.parse(rawContent);
  console.log('JSON解析成功');
  console.log('SKU数量:', Object.keys(map).length);

  // 检查特定SKU
  const target = 'BSD-HC-PCR-0P1ML-001';
  const info = map[target];

  if (info) {
    console.log('\n✅ 找到SKU:', target);
    console.log('图片文件:', info.image);
    console.log('匹配类型:', info.matchType);
    console.log('分类:', info.category);

    // 检查图片文件是否存在
    const imagePath = path.join(__dirname, '../public/images/products', info.image);
    const exists = fs.existsSync(imagePath);
    console.log('\n图片文件存在:', exists ? '✅' : '❌');

    if (exists) {
      console.log('完整路径:', imagePath);
    }
  } else {
    console.log('\n❌ 未找到SKU:', target);
  }

} catch (error) {
  console.error('❌ JSON解析失败:', error.message);
  console.error('\n原始内容（前500字符）:');
  console.log(rawContent.substring(0, 500));
}
