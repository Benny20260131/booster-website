import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n========================================');
console.log('🔍 检查产品数据结构');
console.log('========================================\n');

const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf8')
);

const targetSKU = 'BSD-HC-PCR-0P1ML-001';

// 查找目标产品
let foundProduct = null;

productsData.categories.forEach(category => {
  category.subCategories.forEach(subCategory => {
    subCategory.categories.forEach(productCategory => {
      const product = productCategory.products.find(p => p.brandSku === targetSKU);
      if (product) {
        foundProduct = product;
        console.log(`✅ 找到产品: ${targetSKU}\n`);
        console.log('产品属性:');
        console.log(`  brandSku: ${product.brandSku}`);
        console.log(`  description: ${product.description}`);
        console.log(`  specification: ${product.specification}`);
        console.log(`  category: ${product.category}`);
        console.log(`  _category: ${product._category}`);
        console.log(`  originalCategory: ${product.originalCategory}`);
        console.log(`\n所有键: ${Object.keys(product).join(', ')}`);
      }
    });
  });
});

if (!foundProduct) {
  console.log(`❌ 未找到产品: ${targetSKU}`);
}

// 检查前3个产品
console.log('\n\n前3个产品的category属性:\n');
let count = 0;
productsData.categories.forEach(category => {
  category.subCategories.forEach(subCategory => {
    subCategory.categories.forEach(productCategory => {
      productCategory.products.slice(0, 1).forEach(product => {
        if (count >= 3) return;
        console.log(`${product.brandSku}:`);
        console.log(`  category: ${product.category}`);
        console.log(`  _category: ${product._category}`);
        console.log(`  originalCategory: ${product.originalCategory}`);
        console.log('');
        count++;
      });
    });
  });
});

console.log('========================================\n');
