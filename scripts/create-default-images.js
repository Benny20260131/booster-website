/**
 * 创建分类默认图片
 * 为每个产品分类生成统一的默认占位图
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/images/products');

// 分类配置
const categories = [
  { name: '吸头', color: '#3b82f6', icon: 'TIP' },
  { name: '低吸附吸头', color: '#60a5fa', icon: 'TIP' },
  { name: 'PCR', color: '#ef4444', icon: 'PCR' },
  { name: 'PCR板', color: '#ef4444', icon: 'PCR' },
  { name: 'PCR管', color: '#ef4444', icon: 'PCR' },
  { name: '离心管', color: '#10b981', icon: 'TUBE' },
  { name: '低吸附离心管', color: '#34d399', icon: 'TUBE' },
  { name: '培养', color: '#f59e0b', icon: 'CELL' },
  { name: '培养皿', color: '#f59e0b', icon: 'DISH' },
  { name: '培养板', color: '#f59e0b', icon: 'PLATE' },
  { name: '培养瓶', color: '#f59e0b', icon: 'FLASK' },
  { name: '酶标板', color: '#8b5cf6', icon: 'PLATE' },
  { name: '深孔板', color: '#6366f1', icon: 'PLATE' },
  { name: '试剂瓶', color: '#ec4899', icon: 'BOTTLE' },
  { name: '保存管', color: '#14b8a6', icon: 'TUBE' },
  { name: '冻存管', color: '#06b6d4', icon: 'TUBE' },
  { name: '移液管', color: '#84cc16', icon: 'PIPETTE' },
  { name: '过滤器', color: '#a855f7', icon: 'FILTER' },
  { name: 'default', color: '#6b7280', icon: 'PRODUCT' }
];

// 生成SVG默认图
function generateDefaultSVG(category) {
  const { name, color, icon } = category;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fafafa"/>
      <stop offset="100%" style="stop-color:#f0f0f0"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  
  <!-- 中心图标 -->
  <g transform="translate(400, 320)" filter="url(#shadow)">
    <!-- 外圆 -->
    <circle cx="0" cy="0" r="120" fill="white" stroke="${color}" stroke-width="4"/>
    
    <!-- 图标文字 -->
    <text x="0" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" fill="${color}" font-weight="bold">
      ${icon}
    </text>
  </g>
  
  <!-- 分类名称 -->
  <text x="400" y="520" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="#333" font-weight="bold">
    ${name}
  </text>
  
  <!-- 副标题 -->
  <text x="400" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#666">
    Booster 实验室耗材
  </text>
  
  <!-- 底部品牌 -->
  <text x="400" y="720" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="${color}" font-weight="bold">
    BOOSTER
  </text>
  
  <!-- 占位提示 -->
  <text x="400" y="650" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#999" font-style="italic">
    产品图片准备中
  </text>
</svg>`;
}

function main() {
  console.log('\n========================================');
  console.log('🎨 创建分类默认图片');
  console.log('========================================\n');
  
  let created = 0;
  
  categories.forEach(cat => {
    const svg = generateDefaultSVG(cat);
    const filename = `default-${cat.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    fs.writeFileSync(filepath, svg, 'utf8');
    console.log(`✓ ${filename}`);
    created++;
  });
  
  // 创建通用默认图
  const defaultSvg = generateDefaultSVG({ name: '产品', color: '#6b7280', icon: 'SKU' });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'default-product.svg'), defaultSvg, 'utf8');
  console.log(`✓ default-product.svg`);
  created++;
  
  console.log('\n========================================');
  console.log(`✅ 已创建 ${created} 个默认图片`);
  console.log('========================================\n');
}

main();
