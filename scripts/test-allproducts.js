// 测试App.jsx中的allProducts生成逻辑
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf8')
);

const allProducts = [];

productsData.categories.forEach(category => {
  category.subCategories.forEach(subCat => {
    subCat.categories.forEach(productCategory => {
      productCategory.products.forEach(product => {
        allProducts.push({
          ...product,
          _category: productCategory.name,
          _application: subCat.name,
          _subCategory: category.name
        });
      });
    });
  });
});

console.log('\n========================================');
console.log('🧪 测试allProducts生成');
console.log('========================================\n');

console.log(`总产品数: ${allProducts.length}`);

// 查找目标产品
const target = allProducts.find(p => p.brandSku === 'BSD-HC-PCR-0P1ML-001');
if (target) {
  console.log(`\n✅ 找到BSD-HC-PCR-0P1ML-001:`);
  console.log(`  _category: ${target._category}`);
  console.log(`  _application: ${target._application}`);
  console.log(`  _subCategory: ${target._subCategory}`);
  console.log(`  brandSku: ${target.brandSku}`);
}

// 显示前5个产品
console.log('\n前5个产品:');
allProducts.slice(0, 5).forEach((p, i) => {
  console.log(`  ${i+1}. ${p.brandSku} -> _category: ${p._category}`);
});

console.log('\n========================================\n');

export { allProducts };
