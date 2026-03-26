/**
 * 创建SKU到图片的映射表
 * 将优化后的图片与SKU关联
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取产品数据
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf8')
);

const IMAGES_DIR = path.join(__dirname, '../public/images/products');
const OUTPUT_DIR = path.join(__dirname, '../src/data');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 获取所有图片文件
async function getImageFiles() {
  const files = await glob('*.{jpg,jpeg,png,webp}', { cwd: IMAGES_DIR });
  return files.map(f => ({
    filename: f,
    basename: path.basename(f, path.extname(f))
  }));
}

// 匹配SKU与图片
function matchSKUToImage(sku, description, category, images) {
  // 1. 尝试精确匹配SKU
  const exactMatch = images.find(img => 
    img.basename.toLowerCase().includes(sku.toLowerCase())
  );
  if (exactMatch) return { image: exactMatch.filename, matchType: 'exact' };
  
  // 2. 按产品类型匹配
  const categoryKeywords = {
    '吸头': ['吸头', 'tip'],
    'PCR': ['pcr', '管', '板', '封板膜'],
    '离心管': ['离心管', '保存管'],
    '培养皿': ['培养皿', 'dish'],
    '培养板': ['培养板', '板'],
    '培养瓶': ['培养瓶', '瓶'],
    '酶标板': ['酶标板', '可拆'],
    '深孔板': ['深孔板', '深孔'],
    '试剂瓶': ['试剂瓶', '试剂'],
    '移液管': ['移液管', '移液']
  };
  
  const keywords = categoryKeywords[category] || [category];
  for (const keyword of keywords) {
    const match = images.find(img => 
      img.basename.toLowerCase().includes(keyword.toLowerCase())
    );
    if (match) return { image: match.filename, matchType: 'category' };
  }
  
  // 3. 按描述关键词匹配
  const descKeywords = description.split(/[，,\s]/).filter(w => w.length > 2);
  for (const keyword of descKeywords) {
    const match = images.find(img => 
      img.basename.toLowerCase().includes(keyword.toLowerCase())
    );
    if (match) return { image: match.filename, matchType: 'keyword' };
  }
  
  // 4. 返回默认图片
  return { image: 'default-product.jpg', matchType: 'default' };
}

async function main() {
  console.log('\n========================================');
  console.log('🔗 创建SKU图片映射表');
  console.log('========================================\n');
  
  const images = await getImageFiles();
  console.log(`找到 ${images.length} 个图片文件\n`);
  
  const imageMap = {};
  const stats = { exact: 0, category: 0, keyword: 0, default: 0 };
  
  productsData.categories.forEach(category => {
    category.subCategories.forEach(subCategory => {
      subCategory.categories.forEach(subSubCategory => {
        const catName = subSubCategory.name;
        
        subSubCategory.products.forEach(product => {
          const sku = product.brandSku;
          const result = matchSKUToImage(
            sku, 
            product.description, 
            catName, 
            images
          );
          
          imageMap[sku] = {
            image: result.image,
            matchType: result.matchType,
            category: catName,
            description: product.description
          };
          
          stats[result.matchType]++;
        });
      });
    });
  });
  
  // 保存映射表
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'product-image-map.json'),
    JSON.stringify(imageMap, null, 2),
    'utf8'
  );
  
  console.log('========================================');
  console.log('✅ 映射表创建完成');
  console.log('========================================');
  console.log(`总SKU数: ${Object.keys(imageMap).length}`);
  console.log(`精确匹配: ${stats.exact}`);
  console.log(`分类匹配: ${stats.category}`);
  console.log(`关键词匹配: ${stats.keyword}`);
  console.log(`默认图片: ${stats.default}`);
  console.log(`\n输出文件: src/data/product-image-map.json`);
  console.log('========================================\n');
}

main().catch(console.error);
