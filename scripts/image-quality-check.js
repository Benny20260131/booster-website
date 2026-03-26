/**
 * 图片质量检查工具
 * 检查现有图片是否符合标准
 */

const fs = require('fs');
const path = require('path');

// 图片标准配置
const STANDARDS = {
  minWidth: 800,
  minHeight: 800,
  maxFileSize: 500 * 1024, // 500KB
  allowedFormats: ['.webp', '.jpg', '.jpeg', '.png'],
  preferredFormat: '.webp'
};

console.log('========================================');
console.log('图片质量检查工具');
console.log('========================================\n');

const imagesDir = path.join(__dirname, '../public/images/products');

if (!fs.existsSync(imagesDir)) {
  console.error('❌ 图片目录不存在:', imagesDir);
  process.exit(1);
}

const imageFiles = fs.readdirSync(imagesDir)
  .filter(file => {
    const ext = path.extname(file).toLowerCase();
    return STANDARDS.allowedFormats.includes(ext);
  });

console.log(`📁 找到 ${imageFiles.length} 张图片\n`);

// 检查结果
const results = {
  passed: [],
  warnings: [],
  failed: []
};

// 检查每张图片
imageFiles.forEach(filename => {
  const filePath = path.join(imagesDir, filename);
  const stats = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  const issues = [];
  
  // 1. 格式检查
  if (ext !== STANDARDS.preferredFormat) {
    issues.push({
      type: 'warning',
      message: `建议使用 ${STANDARDS.preferredFormat} 格式而非 ${ext}`
    });
  }
  
  // 2. 文件大小检查
  if (stats.size > STANDARDS.maxFileSize) {
    issues.push({
      type: 'warning',
      message: `文件过大: ${(stats.size/1024).toFixed(1)}KB (建议<${STANDARDS.maxFileSize/1024}KB)`
    });
  }
  
  // 3. 命名规范检查
  const namingPattern = /^[A-Za-z0-9_-]+_(front|side|detail|back|top|bottom)_\d+\.[a-z]+$/;
  if (!namingPattern.test(filename)) {
    // 检查是否包含中文（可能是爬取的图片）
    if (/[\u4e00-\u9fa5]/.test(filename)) {
      issues.push({
        type: 'warning',
        message: '文件名包含中文，建议改为英文命名规范'
      });
    }
  }
  
  // 分类结果
  if (issues.length === 0) {
    results.passed.push({
      filename,
      size: stats.size,
      issues: []
    });
  } else if (issues.every(i => i.type === 'warning')) {
    results.warnings.push({
      filename,
      size: stats.size,
      issues
    });
  } else {
    results.failed.push({
      filename,
      size: stats.size,
      issues
    });
  }
});

// 输出结果
console.log('✅ 通过检查:', results.passed.length);
console.log('⚠️  有警告:', results.warnings.length);
console.log('❌ 未通过:', results.failed.length);
console.log('');

// 显示警告详情
if (results.warnings.length > 0) {
  console.log('⚠️  警告详情 (Top 10):');
  console.log('----------------------------------------');
  results.warnings.slice(0, 10).forEach(item => {
    console.log(`\n${item.filename}`);
    console.log(`  大小: ${(item.size/1024).toFixed(1)}KB`);
    item.issues.forEach(issue => {
      console.log(`  - ${issue.message}`);
    });
  });
  console.log('');
}

// 生成优化建议
console.log('💡 优化建议');
console.log('----------------------------------------');

// 格式转换建议
const nonWebpImages = imageFiles.filter(f => 
  path.extname(f).toLowerCase() !== '.webp'
);
if (nonWebpImages.length > 0) {
  console.log(`1. 格式转换: ${nonWebpImages.length} 张图片需要转换为WebP格式`);
  console.log('   命令: npm run convert-to-webp\n');
}

// 文件大小优化建议
const largeImages = imageFiles.filter(f => {
  const stats = fs.statSync(path.join(imagesDir, f));
  return stats.size > STANDARDS.maxFileSize;
});
if (largeImages.length > 0) {
  console.log(`2. 文件压缩: ${largeImages.length} 张图片文件过大`);
  console.log('   建议: 使用TinyPNG或ImageOptim压缩\n');
}

// 命名规范建议
const nonStandardNames = imageFiles.filter(f => {
  return /[\u4e00-\u9fa5]/.test(f) || !f.includes('_');
});
if (nonStandardNames.length > 0) {
  console.log(`3. 命名规范: ${nonStandardNames.length} 张图片命名不规范`);
  console.log('   建议格式: SKU_angle_number.webp');
  console.log('   示例: BSD-HC-TIP-200UL-001_front_01.webp\n');
}

// 生成优化脚本
const optimizeScript = `
#!/bin/bash
# 图片优化脚本

echo "开始优化图片..."

# 1. 转换为WebP
for file in ${nonWebpImages.map(f => `"${f}"`).join(' ')}; do
  cwebp -q 85 "$file" -o "${'${file%.*}'}.webp"
done

# 2. 压缩大文件
for file in ${largeImages.map(f => `"${f}"`).join(' ')}; do
  cwebp -q 80 "$file" -o "$file"
done

echo "优化完成!"
`;

fs.writeFileSync(
  path.join(__dirname, 'optimize-images.sh'),
  optimizeScript
);

console.log('✅ 优化脚本已生成: scripts/optimize-images.sh');
console.log('========================================');
