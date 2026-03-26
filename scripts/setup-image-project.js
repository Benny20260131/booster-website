/**
 * 图片项目初始化工具
 * 一键设置工作环境
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n========================================');
console.log('🚀 SKU图片项目初始化工具');
console.log('========================================\n');

// 创建必要的目录结构
const directories = [
  '../raw-images',                    // 原始图片存放
  '../raw-images/to-process',         // 待处理图片
  '../raw-images/processed',          // 已处理图片
  '../public/images/products',        // 网站图片目录
  '../output',                        // 输出报告
  '../output/photos',                 // 拍摄清单
  '../output/processed',              // 处理结果
  '../temp',                          // 临时文件
];

console.log('📁 创建目录结构...\n');
directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  ✓ ${dir}`);
  } else {
    console.log(`  ○ ${dir} (已存在)`);
  }
});

// 创建配置文件模板
const configTemplate = {
  project: {
    name: 'Booster SKU图片项目',
    version: '1.0.0',
    startDate: new Date().toISOString().split('T')[0],
    status: 'planning'
  },
  budget: {
    total: 50000,
    spent: 0,
    currency: 'CNY'
  },
  target: {
    totalSKU: 4756,
    prioritySKU: 607,
    targetCoverage: 80
  },
  imageSpecs: {
    size: { width: 800, height: 800 },
    background: '#FFFFFF',
    format: {
      original: 'jpg',
      compressed: 'webp',
      thumbnail: 'webp'
    },
    quality: {
      original: 90,
      compressed: 75,
      thumbnail: 80
    },
    maxSize: {
      compressed: 200 * 1024,  // 200KB
      thumbnail: 20 * 1024     // 20KB
    }
  },
  naming: {
    pattern: '{sku}_{name}.{ext}',
    lowercase: true,
    separator: '_'
  }
};

const configPath = path.join(__dirname, '../image-project.config.json');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(configTemplate, null, 2), 'utf8');
  console.log('\n✓ 创建配置文件: image-project.config.json');
}

// 创建进度追踪文件
const progressTemplate = {
  updatedAt: new Date().toISOString(),
  summary: {
    total: 4756,
    completed: 113,
    inProgress: 0,
    pending: 4643,
    coverage: 2.4
  },
  bySource: {
    crawled: 113,
    purchased: 0,
    rendered: 0,
    photographed: 0,
    aiGenerated: 0
  },
  byCategory: {},
  byPriority: {
    high: { total: 607, completed: 0 },
    medium: { total: 1000, completed: 0 },
    low: { total: 3149, completed: 113 }
  },
  recentUpdates: []
};

const progressPath = path.join(__dirname, '../output/image-progress.json');
if (!fs.existsSync(progressPath)) {
  fs.writeFileSync(progressPath, JSON.stringify(progressTemplate, null, 2), 'utf8');
  console.log('✓ 创建进度追踪: output/image-progress.json');
}

// 创建README
const readmeContent = `# 图片项目工作目录

## 目录结构

\`\`\`
.
├── raw-images/          # 原始图片
│   ├── to-process/      # 待处理图片
│   └── processed/       # 已处理图片
├── public/images/products/  # 网站图片目录
├── output/              # 输出文件
│   ├── photos/          # 拍摄清单
│   └── processed/       # 处理结果
└── temp/                # 临时文件
\`\`\`

## 使用流程

1. **获取图片** → 放入 raw-images/to-process/
2. **批量处理** → 运行 npm run process-images
3. **重命名** → 运行 npm run rename-images
4. **质量检查** → 运行 npm run check-images
5. **上传上线** → 图片自动同步到网站

## 配置文件

- image-project.config.json - 项目配置
- output/image-progress.json - 进度追踪

## 相关命令

\`\`\`bash
# 生成需求清单
node scripts/generate-image-requirements.js

# 批量重命名
node scripts/batch-rename.js rename raw-images public/images/products

# 处理图片（需要安装sharp）
node scripts/process-images.js

# 更新进度
node scripts/update-progress.js
\`\`\`
`;

const readmePath = path.join(__dirname, '../images-workspace/README.md');
if (!fs.existsSync(path.dirname(readmePath))) {
  fs.mkdirSync(path.dirname(readmePath), { recursive: true });
}
fs.writeFileSync(readmePath, readmeContent, 'utf8');
console.log('✓ 创建工作区说明: images-workspace/README.md');

// 创建package.json脚本建议
const npmScripts = {
  "image:requirements": "node scripts/generate-image-requirements.js",
  "image:rename": "node scripts/batch-rename.js rename",
  "image:mapping": "node scripts/batch-rename.js mapping",
  "image:process": "node scripts/process-images.js",
  "image:check": "node scripts/image-quality-check.js",
  "image:setup": "node scripts/setup-image-project.js",
  "image:progress": "node scripts/update-progress.js"
};

console.log('\n========================================');
console.log('📦 建议添加到 package.json 的脚本:');
console.log('========================================\n');
console.log(JSON.stringify({ scripts: npmScripts }, null, 2));

// 输出下一步行动指南
console.log('\n========================================');
console.log('✅ 初始化完成！下一步行动:');
console.log('========================================\n');
console.log('1. 将获取的图片放入: raw-images/to-process/');
console.log('2. 运行: npm run image:rename -- --dry-run (预览)');
console.log('3. 运行: npm run image:rename (执行重命名)');
console.log('4. 运行: npm run image:process (处理图片)');
console.log('5. 运行: npm run image:check (质量检查)');
console.log('\n📖 查看文档:');
console.log('  - IMAGE_STATUS_REPORT.md (现状报告)');
console.log('  - SKU_IMAGE_IMPLEMENTATION_PLAN.md (实施方案)');
console.log('  - QUICK_START_IMAGES.md (快速指南)');
console.log('\n========================================\n');
