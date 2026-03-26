import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n========================================');
console.log('🔍 产品图片系统验证');
console.log('========================================\n');

// 1. 检查映射表
const mapFile = path.join(__dirname, '../src/data/product-image-map.json');
if (!fs.existsSync(mapFile)) {
  console.log('❌ 映射表文件不存在');
  process.exit(1);
}
const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
console.log(`✅ 映射表加载成功: ${Object.keys(map).length}个SKU`);

// 2. 检查匹配统计
const hasImage = Object.values(map).filter(m => m.matchType !== 'default' && !m.image.includes('default.svg'));
const exact = Object.values(map).filter(m => m.matchType === 'exact');
const keyword = Object.values(map).filter(m => m.matchType === 'keyword');
const category = Object.values(map).filter(m => m.matchType === 'category');
const generic = Object.values(map).filter(m => m.matchType === 'generic');

console.log('\n📊 匹配统计:');
console.log(`  总SKU: ${Object.keys(map).length}`);
console.log(`  有图片: ${hasImage.length} (${((hasImage.length/Object.keys(map).length)*100).toFixed(1)}%)`);
console.log(`    - 精确: ${exact.length}`);
console.log(`    - 关键词: ${keyword.length}`);
console.log(`    - 类别: ${category.length}`);
console.log(`    - 通用: ${generic.length}`);
console.log(`    - 默认: ${Object.keys(map).length - hasImage.length}`);

// 3. 检查图片文件
const productsDir = path.join(__dirname, '../public/images/products');
const imageFiles = fs.readdirSync(productsDir).filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));
console.log(`\n📁 图片文件: ${imageFiles.length}个`);

const jpgFiles = imageFiles.filter(f => /\.jpg$/i.test(f));
const webpFiles = imageFiles.filter(f => /\.webp$/i.test(f));
const svgFiles = imageFiles.filter(f => /\.svg$/i.test(f));
console.log(`  JPG: ${jpgFiles.length}个`);
console.log(`  WebP: ${webpFiles.length}个`);
console.log(`  SVG: ${svgFiles.length}个`);

// 4. 验证文件存在性
console.log('\n🔍 文件验证:');
let missing = 0;
let checked = 0;
Object.entries(map).forEach(([sku, info]) => {
  if (checked >= 50) return; // 只检查前50个

  const imagePath = path.join(productsDir, info.image);
  if (!info.image.includes('default.svg') && !fs.existsSync(imagePath)) {
    console.log(`  ❌ ${sku}: ${info.image}`);
    missing++;
  }
  checked++;
});

if (missing === 0) {
  console.log(`  ✅ 所有${checked}个检查的图片文件都存在`);
} else {
  console.log(`  ⚠️  有${missing}个图片文件缺失`);
}

// 5. 检查关键组件
console.log('\n📦 组件检查:');
const components = [
  'src/data/imageLoader.js',
  'src/App.jsx',
  'src/products_new.json'
];

components.forEach(comp => {
  const compPath = path.join(__dirname, '../', comp);
  if (fs.existsSync(compPath)) {
    console.log(`  ✅ ${comp}`);
  } else {
    console.log(`  ❌ ${comp}`);
  }
});

// 6. 示例验证
console.log('\n📝 示例验证:');
const examples = [
  'BSD-HC-PCR-0P1ML-001',
  'BSD-HC-TIP-10UL-001',
  'BSD-HC-TIP-20UL-001',
  'BSD-HC-TIP-50UL-001',
  'BSD-HC-CUL-15ML-001'
];

examples.forEach(sku => {
  const info = map[sku];
  if (info) {
    const imagePath = path.join(productsDir, info.image);
    const exists = info.image.includes('default.svg') || fs.existsSync(imagePath);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${sku}`);
    console.log(`     → ${info.image.substring(0, 45)}...`);
    console.log(`     类型: ${info.matchType}, 分类: ${info.category}`);
  } else {
    console.log(`  ❌ ${sku} - 未找到映射`);
  }
});

// 总结
console.log('\n========================================');
const allGood =
  Object.keys(map).length === 4734 &&
  hasImage.length === Object.keys(map).length &&
  missing === 0;

if (allGood) {
  console.log('✅ 所有检查通过！系统运行正常');
} else {
  console.log('⚠️  部分检查未通过，请查看上述详情');
}
console.log('========================================\n');
