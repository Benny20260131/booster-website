/**
 * 图片批量处理工具
 * 功能：压缩、重命名、格式转换、尺寸调整
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 图片处理配置
 */
const CONFIG = {
  // 输入输出目录
  inputDir: path.join(__dirname, '../raw-images'),      // 原始图片目录
  outputDir: path.join(__dirname, '../public/images/products'), // 处理后输出目录
  
  // 图片规格
  specs: {
    main: {
      width: 800,
      height: 800,
      quality: 90,
      format: 'jpg',
      background: '#FFFFFF'
    },
    thumb: {
      width: 200,
      height: 200,
      quality: 80,
      format: 'webp',
      maxSize: 20 * 1024  // 20KB
    },
    compressed: {
      width: 800,
      height: 800,
      quality: 75,
      format: 'webp',
      maxSize: 200 * 1024  // 200KB
    }
  },
  
  // 命名规则
  naming: {
    pattern: '{sku}_{name}.{ext}',
    sanitize: true,  // 清理特殊字符
    lowercase: true  // 转小写
  }
};

/**
 * 图片处理类
 */
class ImageProcessor {
  constructor(config) {
    this.config = config;
    this.stats = {
      processed: 0,
      failed: 0,
      skipped: 0,
      compressed: 0
    };
    this.errors = [];
  }

  /**
   * 初始化目录
   */
  initDirectories() {
    [this.config.inputDir, this.config.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ 创建目录: ${dir}`);
      }
    });
  }

  /**
   * 生成标准文件名
   */
  generateFilename(sku, productName, format = 'jpg') {
    let name = productName
      .replace(/[<>:"/\\|?*]/g, '')  // 移除非法字符
      .replace(/\s+/g, '_')           // 空格转下划线
      .substring(0, 50);              // 限制长度
    
    if (this.config.naming.lowercase) {
      name = name.toLowerCase();
      sku = sku.toLowerCase();
    }
    
    return `${sku}_${name}.${format}`;
  }

  /**
   * 获取文件大小（可读格式）
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 处理单个图片
   */
  async processImage(inputPath, sku, productName) {
    try {
      const ext = path.extname(inputPath).toLowerCase();
      const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      
      if (!supportedFormats.includes(ext)) {
        throw new Error(`不支持的格式: ${ext}`);
      }

      // 读取文件信息
      const stats = fs.statSync(inputPath);
      const originalSize = stats.size;

      // 生成文件名
      const mainFilename = this.generateFilename(sku, productName, 'jpg');
      const compressedFilename = this.generateFilename(sku, productName + '_compressed', 'webp');
      const thumbFilename = this.generateFilename(sku, productName + '_thumb', 'webp');

      // 输出路径
      const mainPath = path.join(this.config.outputDir, mainFilename);
      const compressedPath = path.join(this.config.outputDir, compressedFilename);
      const thumbPath = path.join(this.config.outputDir, thumbFilename);

      // 注意：实际的图片处理需要使用 sharp 库
      // 这里提供处理逻辑框架
      console.log(`  处理: ${path.basename(inputPath)}`);
      console.log(`    → ${mainFilename} (800x800)`);
      console.log(`    → ${compressedFilename} (≤200KB)`);
      console.log(`    → ${thumbFilename} (200x200)`);

      this.stats.processed++;
      
      return {
        success: true,
        sku,
        files: {
          main: mainFilename,
          compressed: compressedFilename,
          thumbnail: thumbFilename
        },
        originalSize: this.formatFileSize(originalSize)
      };

    } catch (error) {
      this.stats.failed++;
      this.errors.push({
        file: inputPath,
        sku,
        error: error.message
      });
      console.error(`  ✗ 失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量处理目录中的所有图片
   */
  async processBatch(imageList) {
    console.log('\n========================================');
    console.log('🖼️  开始批量处理图片');
    console.log('========================================\n');

    this.initDirectories();

    const results = [];
    for (const item of imageList) {
      const result = await this.processImage(
        item.inputPath,
        item.sku,
        item.productName
      );
      results.push(result);
    }

    this.printSummary();
    return results;
  }

  /**
   * 打印处理摘要
   */
  printSummary() {
    console.log('\n========================================');
    console.log('📊 处理完成摘要');
    console.log('========================================');
    console.log(`✓ 成功处理: ${this.stats.processed}`);
    console.log(`✗ 失败: ${this.stats.failed}`);
    console.log(`○ 跳过: ${this.stats.skipped}`);
    console.log('========================================');

    if (this.errors.length > 0) {
      console.log('\n⚠️  错误详情:');
      this.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.sku}: ${err.error}`);
      });
    }
  }

  /**
   * 生成处理报告
   */
  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      processed: results.filter(r => r.success),
      failed: results.filter(r => !r.success),
      errors: this.errors
    };

    const reportPath = path.join(__dirname, '../output/process-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 报告已保存: ${reportPath}`);
  }
}

/**
 * 主函数
 */
async function main() {
  const processor = new ImageProcessor(CONFIG);
  
  // 示例：处理单个图片
  // await processor.processImage(
  //   path.join(CONFIG.inputDir, 'example.jpg'),
  //   'BSD-HC-TIP-10UL-001',
  //   '10ul吸头'
  // );

  console.log('图片处理工具已就绪');
  console.log('\n使用方法:');
  console.log('1. 将原始图片放入 raw-images/ 目录');
  console.log('2. 运行: node scripts/image-processor.js');
  console.log('3. 处理后的图片将保存到 public/images/products/');
  console.log('\n注意：需要安装 sharp 库进行实际的图片处理');
  console.log('  npm install sharp');
}

// 导出供其他模块使用
export { ImageProcessor, CONFIG };

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
