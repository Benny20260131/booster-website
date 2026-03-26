/**
 * 图片需求分析工具
 * 分析产品数据，生成缺失图片清单
 */

const fs = require('fs');
const path = require('path');

// 读取产品数据
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf-8')
);

// 读取现有图片
const imagesDir = path.join(__dirname, '../public/images/products');
const existingImages = fs.existsSync(imagesDir) 
  ? fs.readdirSync(imagesDir)
  : [];

console.log('========================================');
console.log('BOOSTER 产品图片需求分析');
console.log('========================================\n');

// 统计信息
const stats = {
  totalProducts: 0,
  productsWithImages: 0,
  productsWithoutImages: 0,
  byCategory: {}
};

// 图片匹配函数
function findMatchingImages(sku, description) {
  const matches = [];
  
  // 1. 精确SKU匹配
  const skuMatch = existingImages.find(img => 
    img.toLowerCase().includes(sku.toLowerCase())
  );
  if (skuMatch) matches.push({ type: 'sku', file: skuMatch });
  
  // 2. 描述关键词匹配
  if (description) {
    const keywords = description.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2);
    
    const descMatches = existingImages.filter(img => {
      const imgLower = img.toLowerCase();
      return keywords.some(kw => imgLower.includes(kw));
    });
    
    descMatches.forEach(match => {
      if (!matches.find(m => m.file === match)) {
        matches.push({ type: 'description', file: match });
      }
    });
  }
  
  return matches;
}

// 计算优先级
function calculatePriority(product, category) {
  let score = 0;
  
  // 基础分
  score += 50;
  
  // 吸头类产品优先级高
  if (category.includes('吸头') || category.includes('Tip')) {
    score += 30;
  }
  
  // PCR产品优先级高
  if (category.includes('PCR')) {
    score += 30;
  }
  
  // 常用规格优先级高
  if (product.description) {
    if (product.description.includes('200ul') || 
        product.description.includes('200 ul') ||
        product.description.includes('1000ul')) {
      score += 20;
    }
  }
  
  return score;
}

// 遍历所有产品
const missingImages = [];
const withImages = [];

productsData.categories.forEach(category => {
  category.subCategories.forEach(subCat => {
    subCategories.categories.forEach(cat => {
      const categoryName = `${category.name} > ${subCat.name} > ${cat.name}`;
      
      if (!stats.byCategory[categoryName]) {
        stats.byCategory[categoryName] = {
          total: 0,
          withImages: 0,
          withoutImages: 0
        };
      }
      
      cat.products.forEach(product => {
        stats.totalProducts++;
        stats.byCategory[categoryName].total++;
        
        const matches = findMatchingImages(
          product.brandSku, 
          product.description
        );
        
        if (matches.length > 0) {
          stats.productsWithImages++;
          stats.byCategory[categoryName].withImages++;
          withImages.push({
            sku: product.brandSku,
            description: product.description,
            category: categoryName,
            images: matches
          });
        } else {
          stats.productsWithoutImages++;
          stats.byCategory[categoryName].withoutImages++;
          missingImages.push({
            sku: product.brandSku,
            description: product.description,
            specification: product.specification,
            category: categoryName,
            priority: calculatePriority(product, cat.name),
            recommendedAngles: ['front', 'side', 'detail']
          });
        }
      });
    });
  });
});

// 按优先级排序
missingImages.sort((a, b) => b.priority - a.priority);

// 输出统计信息
console.log('📊 统计概览');
console.log('----------------------------------------');
console.log(`总产品数: ${stats.totalProducts}`);
console.log(`已有图片: ${stats.productsWithImages} (${(stats.productsWithImages/stats.totalProducts*100).toFixed(1)}%)`);
console.log(`缺失图片: ${stats.productsWithoutImages} (${(stats.productsWithoutImages/stats.totalProducts*100).toFixed(1)}%)`);
console.log('');

// 按分类统计
console.log('📁 分类统计 (Top 10)');
console.log('----------------------------------------');
const sortedCategories = Object.entries(stats.byCategory)
  .sort((a, b) => b[1].total - a[1].total)
  .slice(0, 10);

sortedCategories.forEach(([name, data]) => {
  const percentage = (data.withoutImages / data.total * 100).toFixed(1);
  console.log(`${name}`);
  console.log(`  总计: ${data.total}, 缺图: ${data.withoutImages} (${percentage}%)`);
});
console.log('');

// 输出高优先级缺失清单
console.log('🔴 高优先级缺失清单 (Top 20)');
console.log('----------------------------------------');
missingImages.slice(0, 20).forEach((item, index) => {
  console.log(`${index + 1}. [P${item.priority}] ${item.sku}`);
  console.log(`   描述: ${item.description?.substring(0, 60)}...`);
  console.log(`   分类: ${item.category}`);
  console.log('');
});

// 生成拍摄计划
console.log('📸 建议拍摄计划');
console.log('----------------------------------------');

const priorityGroups = {
  'P0 (高)': missingImages.filter(i => i.priority >= 80),
  'P1 (中)': missingImages.filter(i => i.priority >= 60 && i.priority < 80),
  'P2 (低)': missingImages.filter(i => i.priority < 60)
};

Object.entries(priorityGroups).forEach(([level, items]) => {
  console.log(`${level}: ${items.length} 个SKU`);
  console.log(`  预计拍摄: ${items.length * 3} 张图片 (3张/SKU)`);
  console.log(`  预计天数: ${Math.ceil(items.length / 30)} 天 (30个/天)`);
  console.log('');
});

// 保存详细报告
const report = {
  generatedAt: new Date().toISOString(),
  statistics: stats,
  missingImages: missingImages,
  withImages: withImages,
  summary: {
    totalProducts: stats.totalProducts,
    missingCount: stats.productsWithoutImages,
    missingPercentage: (stats.productsWithoutImages/stats.totalProducts*100).toFixed(2),
    estimatedPhotoCount: stats.productsWithoutImages * 3,
    estimatedDays: Math.ceil(stats.productsWithoutImages / 30)
  }
};

fs.writeFileSync(
  path.join(__dirname, '../image-requirements-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('✅ 详细报告已保存: image-requirements-report.json');
console.log('========================================');
