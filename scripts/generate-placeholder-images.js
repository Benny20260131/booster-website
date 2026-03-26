/**
 * 为缺失的SKU生成占位图片
 * 使用Canvas生成基于产品描述的图形
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

const OUTPUT_DIR = path.join(__dirname, '../public/images/products-generated');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// SVG模板生成器
function generateProductSVG(product, category) {
  const { brandSku, description, specification } = product;
  
  // 安全处理字段 - 确保是字符串
  const safeDescription = String(description || '');
  const safeSpecification = String(specification || '');
  
  // 提取关键信息
  const capacity = extractCapacity(safeDescription);
  const type = extractType(safeDescription, category);
  const color = getCategoryColor(category);
  
  // 生成简化的产品名称
  const shortName = safeDescription.split('，')[0].substring(0, 20);
  
  // 根据产品类型生成不同的SVG
  let productGraphic = '';
  
  if (category.includes('吸头') || category.includes('TIP')) {
    productGraphic = generateTipGraphic(capacity, color);
  } else if (category.includes('管') || description.includes('管')) {
    productGraphic = generateTubeGraphic(capacity, color);
  } else if (category.includes('板') || description.includes('板')) {
    productGraphic = generatePlateGraphic(capacity, color);
  } else if (category.includes('皿')) {
    productGraphic = generateDishGraphic(capacity, color);
  } else if (category.includes('瓶')) {
    productGraphic = generateBottleGraphic(capacity, color);
  } else {
    productGraphic = generateGenericGraphic(type, color);
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#f5f5f5"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="3" stdDeviation="5" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  
  <!-- 产品图形 -->
  <g transform="translate(400, 350)" filter="url(#shadow)">
    ${productGraphic}
  </g>
  
  <!-- 产品名称 -->
  <text x="400" y="650" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#333" font-weight="bold">
    ${escapeXml(shortName)}
  </text>
  
  <!-- SKU编号 -->
  <text x="400" y="690" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#666">
    ${brandSku}
  </text>
  
  <!-- 规格信息 -->
  <text x="400" y="730" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#999">
    ${escapeXml((safeSpecification || '').substring(0, 40))}
  </text>
  
  <!-- 品牌标识 -->
  <text x="400" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="#dc2626" font-weight="bold">
    BOOSTER
  </text>
  <text x="400" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#666">
    实验室耗材
  </text>
</svg>`;
}

// 提取容量信息
function extractCapacity(description) {
  if (!description || typeof description !== 'string') return '';
  const match = description.match(/(\d+(?:\.\d+)?)\s*(ml|ul|mL|uL|L)/i);
  return match ? match[0] : '';
}

// 提取产品类型
function extractType(description, category) {
  if (category.includes('吸头')) return '吸头';
  if (category.includes('管')) return '管';
  if (category.includes('板')) return '板';
  if (category.includes('皿')) return '皿';
  if (category.includes('瓶')) return '瓶';
  return category.substring(0, 4);
}

// 获取分类颜色
function getCategoryColor(category) {
  const colors = {
    '吸头': '#3b82f6',
    '低吸附吸头': '#60a5fa',
    'PCR': '#ef4444',
    '离心管': '#10b981',
    '培养': '#f59e0b',
    '培养皿': '#f59e0b',
    '培养板': '#f59e0b',
    '培养瓶': '#f59e0b',
    '酶标板': '#8b5cf6',
    '深孔板': '#6366f1',
    '试剂瓶': '#ec4899',
    '保存管': '#14b8a6',
    '冻存管': '#06b6d4',
    '移液管': '#84cc16'
  };
  
  for (const [key, color] of Object.entries(colors)) {
    if (category.includes(key)) return color;
  }
  return '#6b7280';
}

// 生成吸头图形
function generateTipGraphic(capacity, color) {
  const height = capacity.includes('1000') ? 180 : capacity.includes('200') ? 120 : 80;
  return `
    <path d="M -20 ${-height/2} L 20 ${-height/2} L 10 ${height/2} L -10 ${height/2} Z" 
          fill="white" stroke="${color}" stroke-width="3"/>
    <line x1="-15" y1="${-height/2 + 20}" x2="15" y2="${-height/2 + 20}" stroke="${color}" stroke-width="2"/>
    <text x="0" y="10" text-anchor="middle" font-size="16" fill="${color}" font-weight="bold">${capacity}</text>
  `;
}

// 生成管图形
function generateTubeGraphic(capacity, color) {
  const height = capacity.includes('50') ? 150 : capacity.includes('15') ? 100 : 70;
  return `
    <rect x="-25" y="${-height/2}" width="50" height="${height}" rx="5" 
          fill="white" stroke="${color}" stroke-width="3"/>
    <rect x="-25" y="${-height/2}" width="50" height="20" rx="2" 
          fill="${color}"/>
    <text x="0" y="10" text-anchor="middle" font-size="14" fill="${color}" font-weight="bold">${capacity}</text>
  `;
}

// 生成板图形
function generatePlateGraphic(capacity, color) {
  return `
    <rect x="-80" y="-60" width="160" height="120" rx="5" 
          fill="white" stroke="${color}" stroke-width="3"/>
    <g fill="${color}" opacity="0.3">
      ${Array(6).fill(0).map((_, i) => 
        Array(4).fill(0).map((_, j) => 
          `<circle cx="${-60 + i * 24}" cy="${-40 + j * 26}" r="8"/>`
        ).join('')
      ).join('')}
    </g>
    <text x="0" y="90" text-anchor="middle" font-size="14" fill="${color}" font-weight="bold">${capacity}</text>
  `;
}

// 生成皿图形
function generateDishGraphic(capacity, color) {
  return `
    <ellipse cx="0" cy="0" rx="100" ry="100" 
             fill="white" stroke="${color}" stroke-width="3"/>
    <ellipse cx="0" cy="0" rx="85" ry="85" 
             fill="none" stroke="${color}" stroke-width="1" opacity="0.5"/>
    <text x="0" y="10" text-anchor="middle" font-size="16" fill="${color}" font-weight="bold">${capacity}</text>
  `;
}

// 生成瓶图形
function generateBottleGraphic(capacity, color) {
  return `
    <rect x="-40" y="-50" width="80" height="100" rx="10" 
          fill="white" stroke="${color}" stroke-width="3"/>
    <rect x="-20" y="-70" width="40" height="25" rx="3" 
          fill="${color}"/>
    <text x="0" y="10" text-anchor="middle" font-size="16" fill="${color}" font-weight="bold">${capacity}</text>
  `;
}

// 生成通用图形
function generateGenericGraphic(type, color) {
  return `
    <rect x="-60" y="-60" width="120" height="120" rx="10" 
          fill="white" stroke="${color}" stroke-width="4"/>
    <circle cx="0" cy="0" r="40" fill="${color}" opacity="0.2"/>
    <text x="0" y="8" text-anchor="middle" font-size="20" fill="${color}" font-weight="bold">${type}</text>
  `;
}

// XML转义
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 主函数
async function main() {
  console.log('\n========================================');
  console.log('🎨 生成SKU占位图片');
  console.log('========================================\n');
  
  let total = 0;
  let generated = 0;
  const categories = new Set();
  
  // 收集所有SKU
  productsData.categories.forEach(category => {
    category.subCategories.forEach(subCategory => {
      subCategory.categories.forEach(subSubCategory => {
        const catName = subSubCategory.name;
        categories.add(catName);
        
        subSubCategory.products.forEach(product => {
          total++;
          
          // 为每个SKU生成SVG
          const svg = generateProductSVG(product, catName);
          const filename = `${product.brandSku}.svg`;
          const outputPath = path.join(OUTPUT_DIR, filename);
          
          fs.writeFileSync(outputPath, svg, 'utf8');
          generated++;
          
          if (generated % 100 === 0) {
            console.log(`已生成: ${generated}/${total}`);
          }
        });
      });
    });
  });
  
  console.log('\n========================================');
  console.log('✅ 生成完成');
  console.log('========================================');
  console.log(`总SKU数: ${total}`);
  console.log(`已生成: ${generated}`);
  console.log(`产品分类: ${categories.size}个`);
  console.log(`输出目录: ${OUTPUT_DIR}`);
  console.log('========================================\n');
  
  // 保存分类信息
  const categoryList = Array.from(categories).sort();
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'categories.json'),
    JSON.stringify(categoryList, null, 2),
    'utf8'
  );
}

main().catch(console.error);
