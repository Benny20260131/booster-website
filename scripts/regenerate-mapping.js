import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取产品数据
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf8')
);

// 读取现有图片
const imagesDir = path.join(__dirname, '../public/images/products');
const imageFiles = fs.readdirSync(imagesDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

console.log(`找到 ${imageFiles.length} 个图片文件`);

// 创建映射表
const mapping = {};
let matchedCount = 0;

// 按类别处理所有产品
productsData.categories.forEach(category => {
  category.subCategories.forEach(subCategory => {
    subCategory.categories.forEach(productCategory => {
      productCategory.products.forEach(product => {
        const { brandSku, description, specification } = product;
        const fullName = `${category.name}_${description}`;
        const spec = specification || '';

        // 尝试多个匹配策略
        let matchedImage = null;
        let matchType = null;

        // 1. 精确匹配SKU编号
        const skuMatch = imageFiles.find(f => f.includes(brandSku));
        if (skuMatch) {
          matchedImage = skuMatch;
          matchType = 'exact';
          matchedCount++;
        }

        // 2. 匹配完整产品名称
        if (!matchedImage) {
          const descWords = description.replace(/[，,、\s]+/g, '_').substring(0, 30);
          const nameMatch = imageFiles.find(f =>
            f.includes(descWords) && !f.includes('thumb')
          );
          if (nameMatch) {
            matchedImage = nameMatch;
            matchType = 'name';
            matchedCount++;
          }
        }

        // 3. 匹配类别和关键特征
        if (!matchedImage) {
          const categoryKey = category.name;
          const featureMatch = imageFiles.find(f =>
            f.includes(categoryKey) &&
            f.includes(spec.substring(0, 10)) &&
            !f.includes('thumb')
          );
          if (featureMatch) {
            matchedImage = featureMatch;
            matchType = 'category';
            matchedCount++;
          }
        }

        // 4. 匹配任何同类别的图片
        if (!matchedImage) {
          const categoryKey = category.name;
          const anyCategoryMatch = imageFiles.find(f =>
            f.includes(categoryKey) && /\.(jpg|png)$/i.test(f)
          );
          if (anyCategoryMatch) {
            matchedImage = anyCategoryMatch;
            matchType = 'any-category';
            matchedCount++;
          }
        }

        // 保存映射
        mapping[brandSku] = {
          image: matchedImage || 'default.svg',
          matchType: matchedImage ? matchType : 'default',
          category: category.name,
          description: description
        };
      });
    });
  });
});

console.log(`成功匹配 ${matchedCount} 个产品图片`);

// 保存映射表
const outputPath = path.join(__dirname, '../src/data/product-image-map.json');
fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2), 'utf8');
console.log(`映射表已保存到: ${outputPath}`);

// 统计
const total = Object.keys(mapping).length;
const exact = Object.values(mapping).filter(m => m.matchType === 'exact').length;
const name = Object.values(mapping).filter(m => m.matchType === 'name').length;
const category = Object.values(mapping).filter(m => m.matchType === 'category').length;
const anyCategory = Object.values(mapping).filter(m => m.matchType === 'any-category').length;
const defaultImg = Object.values(mapping).filter(m => m.matchType === 'default').length;

console.log('\n匹配统计:');
console.log(`  总产品数: ${total}`);
console.log(`  精确匹配: ${exact}`);
console.log(`  名称匹配: ${name}`);
console.log(`  类别特征: ${category}`);
console.log(`  类别匹配: ${anyCategory}`);
console.log(`  默认图片: ${defaultImg}`);
