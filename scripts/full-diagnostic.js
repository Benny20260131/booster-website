import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n========================================');
console.log('🔍 完整诊断：App.jsx图片加载流程');
console.log('========================================\n');

// 1. 读取产品数据
console.log('📖 步骤1：读取产品数据');
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf8')
);
console.log('✅ 产品数据加载成功');

// 2. 生成allProducts（模拟App.jsx的useMemo）
console.log('\n📦 步骤2：生成allProducts');
const allProducts = [];
productsData.categories.forEach(category => {
  category.subCategories.forEach(subCat => {
    subCat.categories.forEach(cat => {
      cat.products.forEach(product => {
        allProducts.push({
          ...product,
          _category: category.name,
          _application: subCat.name,
          _subCategory: cat.name
        });
      });
    });
  });
});
console.log(`✅ allProducts生成完成: ${allProducts.length}个产品`);

// 3. 读取映射表
console.log('\n📋 步骤3：读取图片映射表');
const productImageMap = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/product-image-map.json'), 'utf8')
);
console.log('✅ 映射表加载成功');

// 4. 模拟getProductImage函数
function getProductImage(sku, category = '', type = 'main') {
  const mapping = productImageMap[sku];
  if (mapping && mapping.image && !mapping.image.includes('default')) {
    const baseName = mapping.image.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    switch (type) {
      case 'thumb':
        return `/images/products/${baseName}_thumb.webp`;
      case 'compressed':
        return `/images/products/${baseName}_compressed.webp`;
      default:
        return `/images/products/${baseName}.jpg`;
    }
  }
  if (category) {
    const categoryDefaults = {
      '吸头': '/images/products/default-吸头.svg',
      'PCR板': '/images/products/default-pcr.svg',
      '培养': '/images/products/default-培养.svg',
      '酶标板': '/images/products/default-酶标板.svg',
      '离心管': '/images/products/default-离心管.svg',
      '保存管': '/images/products/default-保存管.svg'
    };
    if (categoryDefaults[category]) {
      return categoryDefaults[category];
    }
  }
  return '/images/products/default-product.svg';
}

// 5. 测试目标SKU
console.log('\n🧪 步骤4：测试目标SKU');
const targetSKU = 'BSD-HC-PCR-0P1ML-001';
const product = allProducts.find(p => p.brandSku === targetSKU);

if (product) {
  console.log(`✅ 找到产品: ${targetSKU}`);
  console.log(`  - _category: ${product._category}`);
  console.log(`  - _application: ${product._application}`);
  console.log(`  - _subCategory: ${product._subCategory}`);

  // 生成图片URL
  const imageUrl = getProductImage(targetSKU, product._category);
  console.log(`\n📸 步骤5：生成图片URL`);
  console.log(`  - 图片URL: ${imageUrl}`);

  // 检查文件是否存在
  const publicDir = path.join(__dirname, '../public');
  const imagePath = path.join(publicDir, imageUrl);
  const exists = fs.existsSync(imagePath);

  console.log(`\n🔍 步骤6：验证文件`);
  console.log(`  - 文件路径: ${imagePath}`);
  console.log(`  - 文件存在: ${exists ? '✅' : '❌'}`);

  if (exists) {
    const stats = fs.statSync(imagePath);
    console.log(`  - 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`  - 是否为文件: ${stats.isFile() ? '✅' : '❌'}`);
    console.log(`\n✅ 诊断完成！图片应该能正常显示！`);
  } else {
    console.log(`\n❌ 诊断失败！图片文件不存在！`);
  }
} else {
  console.log(`❌ 未找到产品: ${targetSKU}`);
}

// 6. 测试其他SKU
console.log('\n\n🧪 其他SKU测试:');
const otherSKUs = ['BSD-HC-TIP-10UL-001', 'BSD-HC-TIP-20UL-001', 'BSD-HC-TIP-50UL-001'];
otherSKUs.forEach(sku => {
  const p = allProducts.find(prod => prod.brandSku === sku);
  if (p) {
    const url = getProductImage(sku, p._category);
    const imagePath = path.join(__dirname, '../public', url);
    const exists = fs.existsSync(imagePath);
    console.log(`  ${sku}: ${exists ? '✅' : '❌'} ${p._category}`);
  }
});

console.log('\n========================================\n');
