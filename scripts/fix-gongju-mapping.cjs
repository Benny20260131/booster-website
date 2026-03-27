/**
 * 修复工具酶图片映射中的3个错误 SKU
 * BSDT80602-1.0 → 应映射到 BSDT80602-1（已有）
 * BSDTYN024-24  → 应映射到 BSDTYN024（已有）
 * BSDTYN096-96  → 应映射到 BSDTYN096（已有）
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT, 'src/data/all-products.json');
const IMAGE_MAP_FILE = path.join(ROOT, 'src/data/product-image-map.json');

let products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
let imageMap = JSON.parse(fs.readFileSync(IMAGE_MAP_FILE, 'utf8'));

// 需要删除的错误新增产品 SKU
const wrongSkus = ['BSDT80602-1.0', 'BSDTYN024-24', 'BSDTYN096-96'];

// 正确的映射：错误SKU对应的图片 → 正确的数据库SKU
const corrections = {
  'BSDT80602-1.0': {
    correctSku: 'BSDT80602-1',
    image: '工具酶/BSDT80602-1.0mg_Hyaluronidase_NEW.jpg',
  },
  'BSDTYN024-24': {
    correctSku: 'BSDTYN024',
    image: '工具酶/BSDTYN024-24T_SPE_NEW.jpg',
  },
  'BSDTYN096-96': {
    correctSku: 'BSDTYN096',
    image: '工具酶/BSDTYN096-96T_SPE_NEW.jpg',
  },
};

// 1. 从 all-products.json 移除错误的新增条目
const beforeCount = products.length;
products = products.filter(p => !wrongSkus.includes(p.sku));
console.log(`all-products.json: 删除 ${beforeCount - products.length} 条错误产品`);

// 2. 从 product-image-map.json 删除错误条目，并将图片映射到正确 SKU
for (const [wrongSku, info] of Object.entries(corrections)) {
  // 删除错误 key
  if (imageMap[wrongSku]) {
    delete imageMap[wrongSku];
    console.log(`image-map: 删除错误条目 ${wrongSku}`);
  }
  // 为正确 SKU 添加映射
  imageMap[info.correctSku] = {
    image: info.image,
    matchType: 'exact',
    category: '工具酶',
    skuMatch: info.correctSku,
  };
  console.log(`image-map: 添加正确映射 ${info.correctSku} → ${info.image}`);
}

// 写回文件
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(IMAGE_MAP_FILE, JSON.stringify(imageMap, null, 2), 'utf8');

console.log(`\n✅ 修复完成！`);
console.log(`   all-products.json: ${products.length} 条产品`);
console.log(`   product-image-map.json: ${Object.keys(imageMap).length} 条映射`);
