/**
 * 优化现有图片
 * 调整尺寸、压缩、格式转换
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '../public/images/products');
const OUTPUT_DIR = path.join(__dirname, '../public/images/products-optimized');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(inputPath) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const ext = path.extname(inputPath).toLowerCase();
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // 1. 主图 800x800 JPG
    await image
      .resize(800, 800, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .jpeg({ quality: 90, progressive: true })
      .toFile(path.join(OUTPUT_DIR, `${filename}.jpg`));
    
    // 2. 压缩版 WebP (≤200KB)
    await image
      .resize(800, 800, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .webp({ quality: 75, effort: 6 })
      .toFile(path.join(OUTPUT_DIR, `${filename}_compressed.webp`));
    
    // 3. 缩略图 200x200
    await image
      .resize(200, 200, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .webp({ quality: 80 })
      .toFile(path.join(OUTPUT_DIR, `${filename}_thumb.webp`));
    
    console.log(`✓ ${filename}`);
    return { success: true, filename };
  } catch (error) {
    console.error(`✗ ${filename}: ${error.message}`);
    return { success: false, filename, error: error.message };
  }
}

async function main() {
  console.log('\n========================================');
  console.log('🖼️  优化现有图片');
  console.log('========================================\n');
  
  const files = await glob('*.{jpg,jpeg,png,webp}', { cwd: INPUT_DIR, absolute: true });
  console.log(`找到 ${files.length} 个图片文件\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const file of files) {
    const result = await optimizeImage(file);
    if (result.success) success++;
    else failed++;
  }
  
  console.log('\n========================================');
  console.log('📊 优化完成');
  console.log('========================================');
  console.log(`✓ 成功: ${success}`);
  console.log(`✗ 失败: ${failed}`);
  console.log(`📁 输出目录: ${OUTPUT_DIR}`);
  console.log('========================================\n');
}

main();
