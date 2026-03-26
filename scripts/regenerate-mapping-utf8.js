import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 类别映射：产品数据类别 → 图片文件类别
const categoryMapping = {
  'PCR板': ['PCR板', '分子生物类'],
  'PCR管': ['PCR管', '分子生物类'],
  '细胞培养': ['细胞培养类', '细胞'],
  '培养瓶': ['细胞培养类'],
  '培养皿': ['细胞培养类'],
  '离心管': ['微量离心管', '离心管', '分子生物类'],
  '保存管': ['保存管', '样品保存'],
  '酶标板': ['免疫类', '酶标板', '可拆酶标板'],
  '吸头': ['移液处理'],
  '低吸附吸头': ['移液处理'],
  '通用': ['通用', 'unknown', '图片展示']
};

console.log('📖 读取产品数据...');
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf8')
);

console.log('📖 读取图片文件...');
const imagesDir = path.join(__dirname, '../public/images/products');
const imageFiles = fs.readdirSync(imagesDir).filter(f => /\.(jpg|png)$/i.test(f) && !f.includes('thumb'));

console.log(`找到 ${imageFiles.length} 个图片文件`);

// 按图片类别分组
const imageCategories = {};
imageFiles.forEach(file => {
  const category = file.split('_')[0]; // 文件名第一部分是类别
  if (!imageCategories[category]) {
    imageCategories[category] = [];
  }
  imageCategories[category].push(file);
});

console.log('\n📊 图片类别分布:');
Object.entries(imageCategories).forEach(([cat, files]) => {
  console.log(`  ${cat}: ${files.length}个`);
});

// 创建映射表
console.log('\n🔍 开始匹配产品...');
const mapping = {};
let matchStats = {
  exact: 0,
  keyword: 0,
  category: 0,
  generic: 0,
  default: 0
};

productsData.categories.forEach(category => {
  category.subCategories.forEach(subCategory => {
    subCategory.categories.forEach(productCategory => {
      const { name: productCategoryName } = productCategory;

      productCategory.products.forEach(product => {
        const { brandSku, description, specification } = product;

        // 确定图片类别
        let targetCategories = categoryMapping[productCategoryName] || categoryMapping['通用'];
        if (!targetCategories) {
          targetCategories = categoryMapping['通用'];
        }

        let matchedImage = null;
        let matchType = 'default';

        // 1. 精确匹配SKU
        const skuMatch = imageFiles.find(f => f.includes(brandSku));
        if (skuMatch) {
          matchedImage = skuMatch;
          matchType = 'exact';
          matchStats.exact++;
        }

        // 2. 关键词匹配
        if (!matchedImage) {
          const keywords = extractKeywords(description, specification);

          for (const category of targetCategories) {
            const categoryImages = imageCategories[category] || [];
            const match = categoryImages.find(img => {
              const imgLower = img.toLowerCase();
              return keywords.some(kw => imgLower.includes(kw.toLowerCase()));
            });
            if (match) {
              matchedImage = match;
              matchType = 'keyword';
              matchStats.keyword++;
              break;
            }
          }
        }

        // 3. 类别匹配
        if (!matchedImage) {
          for (const category of targetCategories) {
            const categoryImages = imageCategories[category];
            if (categoryImages && categoryImages.length > 0) {
              // 选择该类别的第一个图片
              matchedImage = categoryImages[0];
              matchType = 'category';
              matchStats.category++;
              break;
            }
          }
        }

        // 4. 通用图片
        if (!matchedImage) {
          const genericImages = imageCategories['移液处理'] || imageCategories['分子生物类'] || imageCategories['unknown'];
          if (genericImages && genericImages.length > 0) {
            matchedImage = genericImages[0];
            matchType = 'generic';
            matchStats.generic++;
          }
        }

        // 保存映射 - 确保UTF-8编码
        mapping[brandSku] = {
          image: matchedImage || 'default.svg',
          matchType: matchedImage ? matchType : 'default',
          category: productCategoryName,
          description: String(description || '').substring(0, 50),
          targetCategories: targetCategories.join(',')
        };

        if (!matchedImage) {
          matchStats.default++;
        }
      });
    });
  });
});

// 保存映射表 - 明确指定UTF-8编码
console.log('\n💾 保存映射表...');
const outputPath = path.join(__dirname, '../src/data/product-image-map.json');

// 使用Buffer确保UTF-8编码
const jsonContent = JSON.stringify(mapping, null, 2);
fs.writeFileSync(outputPath, jsonContent, 'utf8');

console.log(`✅ 映射表已保存: ${outputPath}`);

// 统计
const total = Object.keys(mapping).length;
console.log('\n📈 匹配统计:');
console.log(`  总产品数: ${total}`);
console.log(`  精确匹配: ${matchStats.exact}`);
console.log(`  关键词匹配: ${matchStats.keyword}`);
console.log(`  类别匹配: ${matchStats.category}`);
console.log(`  通用图片: ${matchStats.generic}`);
console.log(`  默认图片: ${matchStats.default}`);
console.log(`  有图片产品: ${total - matchStats.default}`);

// 显示示例匹配
console.log('\n📝 示例匹配:');
const examples = ['BSD-HC-PCR-0P1ML-001', 'BSD-HC-TIP-10UL-001', 'BSD-HC-TIP-20UL-001'];
examples.forEach(sku => {
  const info = mapping[sku];
  if (info) {
    console.log(`  ${sku}:`);
    console.log(`    → ${info.image.substring(0, 50)}...`);
    console.log(`    类型: ${info.matchType}, 分类: ${info.category}`);
  }
});

function extractKeywords(description, specification) {
  const keywords = [];
  const text = (description + ' ' + (specification || '')).toLowerCase();

  // 提取容量
  const capacityMatch = text.match(/(\d+(?:\.\d+)?)\s*(ml|ul|l)/i);
  if (capacityMatch) {
    keywords.push(capacityMatch[1].replace('.', '') + capacityMatch[2].toLowerCase());
  }

  // 提取规格特征
  const features = ['无裙边', '半裙边', '全裙边', '高裙边', '96孔', '384孔', '8联管', '12联管', '酶标板', 'PCR板', 'PCR管', '离心管', '培养', '灭菌'];
  features.forEach(feature => {
    if (text.includes(feature.toLowerCase())) {
      keywords.push(feature);
    }
  });

  return keywords;
}
