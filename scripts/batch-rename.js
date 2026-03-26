/**
 * 批量重命名工具
 * 按照 SKU编号_产品名称.jpg 的格式重命名图片
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

// 构建SKU映射表
const skuMap = new Map();
productsData.categories.forEach(category => {
  category.subCategories.forEach(subCategory => {
    subCategory.categories.forEach(subSubCategory => {
      subSubCategory.products.forEach(product => {
        skuMap.set(product.brandSku, {
          sku: product.brandSku,
          name: product.description,
          category: subSubCategory.name,
          shortName: extractShortName(product.description)
        });
      });
    });
  });
});

/**
 * 提取产品短名称（用于文件名）
 */
function extractShortName(description) {
  // 提取关键信息：容量 + 类型
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(ml|ul|mL|uL|L)\s*(.*?)(?:，|,|$)/i,
    /(PCR|吸头|离心管|培养皿|培养板|培养瓶|深孔板|酶标板|冻存管)/i
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[0].replace(/[，,]/g, '').trim();
    }
  }
  
  // 默认返回前30个字符
  return description.substring(0, 30).trim();
}

/**
 * 生成标准文件名
 */
function generateStandardFilename(sku, productName) {
  const shortName = extractShortName(productName)
    .replace(/[<>:"/\\|?*\s]/g, '_')  // 替换非法字符
    .replace(/_+/g, '_')                // 合并多个下划线
    .replace(/^_+|_+$/g, '');           // 移除首尾下划线
  
  return `${sku}_${shortName}.jpg`;
}

/**
 * 批量重命名图片
 */
function batchRename(inputDir, outputDir, options = {}) {
  console.log('\n========================================');
  console.log('📝 批量重命名工具');
  console.log('========================================\n');

  // 确保目录存在
  if (!fs.existsSync(inputDir)) {
    console.error(`✗ 输入目录不存在: ${inputDir}`);
    return;
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 读取所有图片文件
  const files = fs.readdirSync(inputDir)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

  console.log(`找到 ${files.length} 个图片文件\n`);

  let renamed = 0;
  let skipped = 0;
  let failed = 0;
  const log = [];

  files.forEach((filename, index) => {
    const oldPath = path.join(inputDir, filename);
    
    // 尝试匹配SKU
    let sku = null;
    let productInfo = null;
    
    // 从文件名中提取SKU（如果有）
    const skuMatch = filename.match(/(BSD-[A-Z0-9-]+)/i);
    if (skuMatch) {
      sku = skuMatch[1].toUpperCase();
      productInfo = skuMap.get(sku);
    }
    
    // 如果找不到SKU信息，使用默认命名
    if (!productInfo) {
      const newName = `UNKNOWN_${index + 1}_${filename}`;
      const newPath = path.join(outputDir, newName);
      
      if (options.dryRun) {
        console.log(`[预览] ${filename} → ${newName}`);
      } else {
        fs.copyFileSync(oldPath, newPath);
        console.log(`✓ ${filename} → ${newName} (未匹配SKU)`);
      }
      
      log.push({
        original: filename,
        renamed: newName,
        status: 'unmatched',
        sku: null
      });
      
      skipped++;
      return;
    }

    // 生成新文件名
    const newFilename = generateStandardFilename(
      productInfo.sku,
      productInfo.name
    );
    const newPath = path.join(outputDir, newFilename);

    // 检查文件是否已存在
    if (fs.existsSync(newPath) && !options.overwrite) {
      console.log(`○ 跳过(已存在): ${newFilename}`);
      skipped++;
      return;
    }

    if (options.dryRun) {
      console.log(`[预览] ${filename} → ${newFilename}`);
    } else {
      fs.copyFileSync(oldPath, newPath);
      console.log(`✓ ${filename} → ${newFilename}`);
    }

    log.push({
      original: filename,
      renamed: newFilename,
      status: 'success',
      sku: productInfo.sku,
      category: productInfo.category
    });

    renamed++;
  });

  console.log('\n========================================');
  console.log('📊 处理完成');
  console.log('========================================');
  console.log(`✓ 重命名: ${renamed}`);
  console.log(`○ 跳过: ${skipped}`);
  console.log(`✗ 失败: ${failed}`);
  console.log('========================================');

  // 保存日志
  const logPath = path.join(__dirname, '../output/rename-log.json');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf8');
  console.log(`\n📄 日志已保存: ${logPath}`);

  return { renamed, skipped, failed, log };
}

/**
 * 生成CSV映射表
 */
function generateMappingCSV() {
  const mappings = [];
  
  skuMap.forEach((info, sku) => {
    mappings.push({
      sku: sku,
      productName: info.name,
      category: info.category,
      standardFilename: generateStandardFilename(sku, info.name),
      shortName: info.shortName
    });
  });

  const csv = [
    'SKU编号,产品名称,分类,标准文件名,短名称',
    ...mappings.map(m => 
      `"${m.sku}","${m.productName}","${m.category}","${m.standardFilename}","${m.shortName}"`
    )
  ].join('\n');

  const csvPath = path.join(__dirname, '../output/sku-filename-mapping.csv');
  fs.writeFileSync(csvPath, csv, 'utf8');
  console.log(`📄 映射表已保存: ${csvPath}`);
  
  return mappings;
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'rename':
      const inputDir = args[1] || path.join(__dirname, '../raw-images');
      const outputDir = args[2] || path.join(__dirname, '../public/images/products');
      batchRename(inputDir, outputDir, {
        dryRun: args.includes('--dry-run'),
        overwrite: args.includes('--overwrite')
      });
      break;
      
    case 'mapping':
      generateMappingCSV();
      break;
      
    default:
      console.log('
使用方法:
');
      console.log('  node scripts/batch-rename.js rename [输入目录] [输出目录] [选项]');
      console.log('    选项:');
      console.log('      --dry-run    预览模式（不实际重命名）');
      console.log('      --overwrite  覆盖已存在的文件');
      console.log('');
      console.log('  node scripts/batch-rename.js mapping');
      console.log('    生成SKU与文件名的映射表');
      console.log('');
      console.log('示例:');
      console.log('  node scripts/batch-rename.js rename ./photos ./images --dry-run');
      console.log('');
  }
}

main();
