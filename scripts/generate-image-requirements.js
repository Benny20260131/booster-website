/**
 * 生成图片需求清单
 * 分析所有SKU，生成需要补充的图片列表
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取产品数据
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf8')
);

// 读取已有图片
const imagesDir = path.join(__dirname, '../public/images/products');
const existingImages = fs.existsSync(imagesDir) 
  ? fs.readdirSync(imagesDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  : [];

// 统计SKU
const skuList = [];
const categoryStats = {};

productsData.categories.forEach(category => {
  category.subCategories.forEach(subCategory => {
    subCategory.categories.forEach(subSubCategory => {
      subSubCategory.products.forEach(product => {
        const sku = product.brandSku;
        const categoryName = subSubCategory.name;
        
        skuList.push({
          sku: sku,
          name: product.description,
          category: categoryName,
          subCategory: subCategory.name,
          specification: product.specification,
          hasImage: false,
          priority: calculatePriority(categoryName, product)
        });
        
        // 统计分类
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = { total: 0, hasImage: 0 };
        }
        categoryStats[categoryName].total++;
      });
    });
  });
});

// 计算优先级
function calculatePriority(category, product) {
  const highPriority = ['PCR', '吸头', '离心管', '培养皿', '酶标板'];
  const mediumPriority = ['细胞培养', '保存管', '深孔板', '试剂瓶'];
  
  if (highPriority.some(k => category.includes(k))) return '高';
  if (mediumPriority.some(k => category.includes(k))) return '中';
  return '低';
}

// 生成图片需求清单
const imageRequirements = {
  summary: {
    totalSKUs: skuList.length,
    existingImages: existingImages.length,
    neededImages: skuList.length - existingImages.length,
    coverage: ((existingImages.length / skuList.length) * 100).toFixed(1) + '%'
  },
  categoryStats: categoryStats,
  missingImages: skuList.filter(sku => !sku.hasImage),
  highPriority: skuList.filter(sku => sku.priority === '高' && !sku.hasImage),
  requirements: {
    imageSpecs: {
      size: '800x800像素',
      background: '纯白色 (#FFFFFF)',
      format: 'JPG (主图) + WebP (压缩)',
      maxSize: '200KB (压缩版)',
      naming: 'SKU编号_产品名称.jpg'
    }
  }
};

// 保存分析结果
const outputDir = path.join(__dirname, '../output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'image-requirements.json'),
  JSON.stringify(imageRequirements, null, 2),
  'utf8'
);

// 生成CSV格式的拍摄清单
const csvHeader = 'SKU编号,产品名称,产品分类,规格,优先级,建议拍摄角度,备注\n';
const csvContent = skuList
  .filter(sku => !sku.hasImage)
  .map(sku => {
    const shortName = sku.name.length > 30 ? sku.name.substring(0, 30) + '...' : sku.name;
    return `${sku.sku},"${shortName}",${sku.category},"${sku.specification}",${sku.priority},"正面+侧面+细节",待拍摄`;
  })
  .join('\n');

fs.writeFileSync(
  path.join(outputDir, 'photo-shoot-list.csv'),
  csvHeader + csvContent,
  'utf8'
);

console.log('========================================');
console.log('📊 图片需求分析完成');
console.log('========================================');
console.log(`总SKU数量: ${imageRequirements.summary.totalSKUs}`);
console.log(`已有图片: ${imageRequirements.summary.existingImages}`);
console.log(`需要补充: ${imageRequirements.summary.neededImages}`);
console.log(`覆盖率: ${imageRequirements.summary.coverage}`);
console.log('========================================');
console.log('\n分类统计:');
Object.entries(categoryStats).forEach(([cat, stats]) => {
  console.log(`  ${cat}: ${stats.total}个SKU`);
});
console.log('\n文件输出:');
console.log(`  - output/image-requirements.json`);
console.log(`  - output/photo-shoot-list.csv`);
