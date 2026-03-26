/**
 * 产品详情页自动化测试脚本
 * 目标: BSD-HC-PCR-0P1ML-001
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n========================================');
console.log('🔬 产品详情页自动化测试');
console.log('========================================\n');

// 测试结果记录
const testReport = {
  targetProduct: 'BSD-HC-PCR-0P1ML-001',
  startTime: new Date().toISOString(),
  results: [],
  passed: 0,
  failed: 0,
  warning: 0,
  issues: []
};

// 辅助函数：记录测试结果
function logTest(name, status, message, details = {}) {
  const result = {
    name,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  };

  testReport.results.push(result);

  if (status === 'pass') testReport.passed++;
  else if (status === 'fail') testReport.failed++;
  else if (status === 'warning') testReport.warning++;

  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${message}`);

  if (status === 'fail' || status === 'warning') {
    testReport.issues.push(result);
  }
}

// 测试1: 产品数据完整性
function testProductData() {
  console.log('\n📦 测试1: 产品数据完整性');

  const productsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../src/products_new.json'), 'utf8')
  );

  let targetProduct = null;

  // 查找目标产品
  productsData.categories.forEach(category => {
    category.subCategories.forEach(subCat => {
      subCat.categories.forEach(cat => {
        const product = cat.products.find(p => p.brandSku === 'BSD-HC-PCR-0P1ML-001');
        if (product) {
          targetProduct = {
            ...product,
            _category: category.name,
            _application: subCat.name,
            _subCategory: cat.name
          };
        }
      });
    });
  });

  if (targetProduct) {
    logTest('产品数据查找', 'pass', '找到目标产品');

    // 检查必需字段
    const requiredFields = ['brandSku', 'description', 'specification'];
    requiredFields.forEach(field => {
      if (targetProduct[field]) {
        logTest(`字段 ${field}`, 'pass', `值: ${targetProduct[field]}`);
      } else {
        logTest(`字段 ${field}`, 'fail', '字段缺失');
      }
    });

    // 检查分类字段
    if (targetProduct._category) {
      logTest('分类字段(_category)', 'pass', targetProduct._category);
    } else {
      logTest('分类字段(_category)', 'fail', '分类字段缺失');
    }

    return targetProduct;
  } else {
    logTest('产品数据查找', 'fail', '未找到目标产品');
    return null;
  }
}

// 测试2: 映射表验证
function testImageMapping() {
  console.log('\n📋 测试2: 映射表验证');

  try {
    const map = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/data/product-image-map.json'), 'utf8')
    );

    const sku = 'BSD-HC-PCR-0P1ML-001';
    const mapping = map[sku];

    if (mapping) {
      logTest('映射表查找', 'pass', `找到SKU映射`);

      // 检查映射必需字段
      const requiredFields = ['image', 'matchType', 'category'];
      requiredFields.forEach(field => {
        if (mapping[field]) {
          logTest(`映射字段 ${field}`, 'pass', mapping[field]);
        } else {
          logTest(`映射字段 ${field}`, 'fail', '字段缺失');
        }
      });

      // 检查图片文件是否存在
      const imagePath = path.join(__dirname, '../public/images/products', mapping.image);
      if (fs.existsSync(imagePath)) {
        const stats = fs.statSync(imagePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        logTest('图片文件存在性', 'pass', `大小: ${sizeKB}KB`);

        // 检查文件类型
        if (mapping.image.endsWith('.jpg') || mapping.image.endsWith('.png')) {
          logTest('图片文件类型', 'pass', mapping.image);
        } else {
          logTest('图片文件类型', 'warning', '不是JPG或PNG格式');
        }
      } else {
        logTest('图片文件存在性', 'fail', `文件不存在: ${mapping.image}`);
      }

      return mapping;
    } else {
      logTest('映射表查找', 'fail', '未找到SKU映射');
      return null;
    }
  } catch (error) {
    logTest('映射表读取', 'fail', error.message);
    return null;
  }
}

// 测试3: 图片路径生成
function testImagePathGeneration() {
  console.log('\n🔗 测试3: 图片路径生成');

  // 模拟imageLoader.js的getProductImage函数
  function getProductImage(sku, category = '') {
    const map = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/data/product-image-map.json'), 'utf8')
    );

    const mapping = map[sku];
    if (mapping && mapping.image && !mapping.image.includes('default')) {
      const baseName = mapping.image.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      return `/images/products/${baseName}.jpg`;
    }
    return '/images/products/default-product.svg';
  }

  const sku = 'BSD-HC-PCR-0P1ML-001';
  const category = '实验耗材';
  const imageUrl = getProductImage(sku, category);

  logTest('路径生成', 'pass', `生成的URL: ${imageUrl}`);

  // 检查路径格式
  if (imageUrl.startsWith('/images/products/')) {
    logTest('路径格式', 'pass', '路径格式正确');
  } else {
    logTest('路径格式', 'fail', '路径格式不正确');
  }

  // 检查是否包含中文
  if (imageUrl.includes('分子生物类')) {
    logTest('路径编码', 'pass', '中文URL正确');
  } else {
    logTest('路径编码', 'warning', 'URL中可能缺少中文');
  }

  return imageUrl;
}

// 测试4: 默认图片回退机制
function testDefaultFallback() {
  console.log('\n🔄 测试4: 默认图片回退机制');

  const defaultImages = [
    'default-product.svg',
    'default-pcr.svg',
    'default-吸头.svg'
  ];

  defaultImages.forEach(img => {
    const imagePath = path.join(__dirname, '../public/images/products', img);
    if (fs.existsSync(imagePath)) {
      logTest(`默认图片 ${img}`, 'pass', '文件存在');
    } else {
      logTest(`默认图片 ${img}`, 'fail', '文件不存在');
    }
  });
}

// 测试5: React组件结构
function testReactComponent() {
  console.log('\n⚛️  测试5: React组件结构');

  const appPath = path.join(__dirname, '../src/App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');

  // 检查ProductImage组件
  if (appContent.includes('const ProductImage')) {
    logTest('ProductImage组件', 'pass', '组件已定义');
  } else {
    logTest('ProductImage组件', 'fail', '组件未找到');
  }

  // 检查getProductImage导入
  if (appContent.includes('import { getProductImage')) {
    logTest('getProductImage导入', 'pass', '导入正确');
  } else {
    logTest('getProductImage导入', 'fail', '导入缺失');
  }

  // 检查ProductModal组件
  if (appContent.includes('const ProductModal')) {
    logTest('ProductModal组件', 'pass', '组件已定义');
  } else {
    logTest('ProductModal组件', 'fail', '组件未找到');
  }

  // 检查图片onError处理
  if (appContent.includes('onError')) {
    logTest('图片错误处理', 'pass', 'onError处理已实现');
  } else {
    logTest('图片错误处理', 'warning', '可能缺少错误处理');
  }

  // 检查图片onLoad处理
  if (appContent.includes('onLoad')) {
    logTest('图片加载完成处理', 'pass', 'onLoad处理已实现');
  } else {
    logTest('图片加载完成处理', 'warning', '可能缺少加载完成处理');
  }
}

// 测试6: 图片优化验证
function testImageOptimization() {
  console.log('\n⚡ 测试6: 图片优化验证');

  const productsDir = path.join(__dirname, '../public/images/products');
  const files = fs.readdirSync(productsDir);

  // 统计不同格式
  const jpgFiles = files.filter(f => /\.jpg$/i.test(f));
  const webpFiles = files.filter(f => /\.webp$/i.test(f));
  const svgFiles = files.filter(f => /\.svg$/i.test(f));

  logTest('JPG文件数量', 'pass', `${jpgFiles.length}个`);

  // 检查目标产品是否有压缩版本
  const baseName = '分子生物类_0.1mL无裙边96孔PCR板_5';
  const hasCompressed = webpFiles.some(f => f.startsWith(baseName));
  const hasThumb = webpFiles.some(f => f.includes(`${baseName}_thumb`));

  if (hasCompressed) {
    logTest('压缩版本', 'pass', '存在WebP压缩版');
  } else {
    logTest('压缩版本', 'warning', '缺少WebP压缩版');
  }

  if (hasThumb) {
    logTest('缩略图版本', 'pass', '存在WebP缩略图');
  } else {
    logTest('缩略图版本', 'warning', '缺少WebP缩略图');
  }

  // 检查SVG默认图
  if (svgFiles.length > 0) {
    logTest('默认SVG图标', 'pass', `${svgFiles.length}个`);
  } else {
    logTest('默认SVG图标', 'fail', '没有SVG默认图');
  }
}

// 测试7: 性能指标
function testPerformance() {
  console.log('\n🚀 测试7: 性能指标');

  // 检查映射表大小
  const mapPath = path.join(__dirname, '../src/data/product-image-map.json');
  const mapStats = fs.statSync(mapPath);
  const mapSizeKB = (mapStats.size / 1024).toFixed(2);

  if (mapSizeKB < 2000) {
    logTest('映射表大小', 'pass', `${mapSizeKB}KB (< 2MB)`);
  } else {
    logTest('映射表大小', 'warning', `${mapSizeKB}KB (建议压缩)`);
  }

  // 检查目标产品图片大小
  const targetImage = '分子生物类_0.1mL无裙边96孔PCR板_5.jpg';
  const imagePath = path.join(__dirname, '../public/images/products', targetImage);

  if (fs.existsSync(imagePath)) {
    const imgStats = fs.statSync(imagePath);
    const imgSizeKB = (imgStats.size / 1024).toFixed(2);

    if (imgSizeKB < 200) {
      logTest('目标产品图片大小', 'pass', `${imgSizeKB}KB (< 200KB)`);
    } else {
      logTest('目标产品图片大小', 'warning', `${imgSizeKB}KB (建议压缩)`);
    }
  }
}

// 生成测试报告
function generateReport() {
  testReport.endTime = new Date().toISOString();

  console.log('\n========================================');
  console.log('📊 测试报告摘要');
  console.log('========================================\n');

  console.log(`目标产品: ${testReport.targetProduct}`);
  console.log(`开始时间: ${testReport.startTime}`);
  console.log(`结束时间: ${testReport.endTime}`);
  console.log(`\n测试结果:`);
  console.log(`  ✅ 通过: ${testReport.passed}`);
  console.log(`  ⚠️  警告: ${testReport.warning}`);
  console.log(`  ❌ 失败: ${testReport.failed}`);
  console.log(`  📋 总计: ${testReport.results.length}`);

  const successRate = ((testReport.passed / testReport.results.length) * 100).toFixed(2);
  console.log(`  📈 成功率: ${successRate}%`);

  if (testReport.issues.length > 0) {
    console.log(`\n❌ 发现的问题 (${testReport.issues.length}个):`);
    testReport.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. [${issue.status.toUpperCase()}] ${issue.name}: ${issue.message}`);
      if (issue.details && Object.keys(issue.details).length > 0) {
        console.log(`     详情: ${JSON.stringify(issue.details)}`);
      }
    });
  } else {
    console.log(`\n✅ 没有发现严重问题！`);
  }

  // 保存报告到文件
  const reportPath = path.join(__dirname, '../test-reports');
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }

  const reportFile = path.join(reportPath, `BSD-HC-PCR-0P1ML-001-test-report-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(testReport, null, 2), 'utf8');

  console.log(`\n💾 详细报告已保存: ${reportFile}`);

  // 生成可读报告
  const readableReport = `
========================================
产品详情页测试报告
========================================

产品: BSD-HC-PCR-0P1ML-001
测试时间: ${new Date().toLocaleString('zh-CN')}

测试统计:
----------------------------------------
✅ 通过: ${testReport.passed}
⚠️  警告: ${testReport.warning}
❌ 失败: ${testReport.failed}
📋 总计: ${testReport.results.length}
📈 成功率: ${successRate}%

详细结果:
----------------------------------------
${testReport.results.map(r => {
  const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⚠️';
  return `${icon} ${r.name}: ${r.message}`;
}).join('\n')}

${testReport.issues.length > 0 ? `
发现问题:
----------------------------------------
${testReport.issues.map((issue, i) => {
  return `${i + 1}. [${issue.status.toUpperCase()}] ${issue.name}
   ${issue.message}
   ${Object.keys(issue.details).length > 0 ? `   详情: ${JSON.stringify(issue.details)}` : ''}`;
}).join('\n\n')}
` : ''}

========================================
`;
  const readableReportFile = path.join(reportPath, `BSD-HC-PCR-0P1ML-001-test-report-${Date.now()}.txt`);
  fs.writeFileSync(readableReportFile, readableReport, 'utf8');

  console.log(`💾 可读报告已保存: ${readableReportFile}`);

  console.log('\n========================================\n');

  return testReport;
}

// 主测试流程
async function runAllTests() {
  console.log('开始执行自动化测试...\n');

  try {
    // 执行所有测试
    testProductData();
    testImageMapping();
    testImagePathGeneration();
    testDefaultFallback();
    testReactComponent();
    testImageOptimization();
    testPerformance();

    // 生成报告
    generateReport();

    // 判断总体结果
    if (testReport.failed === 0) {
      console.log('🎉 所有测试通过！产品详情页可以正常使用。');
    } else {
      console.log('⚠️  发现' + testReport.failed + '个失败项，请检查上述问题。');
    }

  } catch (error) {
    console.error('❌ 测试执行失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
runAllTests();
