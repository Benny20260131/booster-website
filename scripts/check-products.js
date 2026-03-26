import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取产品数据
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf8')
);

// 查看前10个产品的类别结构
let count = 0;
productsData.categories.forEach(category => {
  category.subCategories.forEach(subCategory => {
    subCategory.categories.forEach(productCategory => {
      productCategory.products.slice(0, 2).forEach(product => {
        console.log(`类别: ${category.name}`);
        console.log(`  子类别: ${subCategory.name}`);
        console.log(`  产品类别: ${productCategory.name}`);
        console.log(`  SKU: ${product.brandSku}`);
        console.log(`  描述: ${product.description.substring(0, 50)}...`);
        console.log(`  规格: ${product.specification}`);
        console.log('---');
        count++;
        if (count >= 10) process.exit(0);
      });
    });
  });
});
