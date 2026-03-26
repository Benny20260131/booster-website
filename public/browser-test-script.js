/**
 * 浏览器端产品详情页测试脚本
 * 目标: BSD-HC-PCR-0P1ML-001
 *
 * 使用方法:
 * 1. 打开浏览器开发者工具 (F12)
 * 2. 切换到Console标签
 * 3. 复制并运行此脚本
 */

(function() {
  console.log('========================================');
  console.log('🔬 浏览器端产品详情页测试');
  console.log('========================================\n');

  const targetSKU = 'BSD-HC-PCR-0P1ML-001';
  const targetImage = '/images/products/分子生物类_0.1mL无裙边96孔PCR板_5.jpg';

  let testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  // 测试1: 检查映射表加载
  async function testMappingLoad() {
    console.log('📋 测试1: 映射表加载');
    try {
      const response = await fetch('/data/product-image-map.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const map = await response.json();
      const mapping = map[targetSKU];

      if (mapping) {
        console.log('  ✅ 映射表加载成功');
        console.log(`  📊 SKU总数: ${Object.keys(map).length}`);
        console.log(`  🎯 目标SKU映射:`, mapping);

        testResults.passed++;
        testResults.details.push({
          test: '映射表加载',
          status: 'pass',
          details: mapping
        });
        return mapping;
      } else {
        console.log('  ❌ 未找到目标SKU映射');
        testResults.failed++;
        testResults.details.push({
          test: '映射表查找',
          status: 'fail',
          details: '未找到SKU'
        });
        return null;
      }
    } catch (error) {
      console.log(`  ❌ 映射表加载失败: ${error.message}`);
      testResults.failed++;
      testResults.details.push({
        test: '映射表加载',
        status: 'fail',
        error: error.message
      });
      return null;
    }
  }

  // 测试2: 检查图片加载
  function testImageLoad(imageUrl, description) {
    return new Promise((resolve) => {
      console.log(`\n🖼️  测试: ${description}`);
      console.log(`  URL: ${imageUrl}`);

      const img = new Image();
      const startTime = performance.now();

      img.onload = () => {
        const endTime = performance.now();
        const loadTime = (endTime - startTime).toFixed(2);

        console.log(`  ✅ 加载成功`);
        console.log(`  📐 尺寸: ${img.naturalWidth}x${img.naturalHeight}px`);
        console.log(`  ⏱️  加载时间: ${loadTime}ms`);

        testResults.passed++;
        testResults.details.push({
          test: description,
          status: 'pass',
          size: `${img.naturalWidth}x${img.naturalHeight}`,
          loadTime: loadTime + 'ms'
        });

        resolve({
          success: true,
          size: `${img.naturalWidth}x${img.naturalHeight}`,
          loadTime: loadTime
        });
      };

      img.onerror = () => {
        console.log(`  ❌ 加载失败`);
        testResults.failed++;
        testResults.details.push({
          test: description,
          status: 'fail',
          error: '图片加载失败'
        });
        resolve({
          success: false,
          error: '图片加载失败'
        });
      };

      img.src = imageUrl;
    });
  }

  // 测试3: 检查DOM元素
  function testDOMElements() {
    console.log('\n🏗️  测试3: DOM元素检查');

    // 查找所有产品图片
    const productImages = document.querySelectorAll('img[src*="/images/products/"]');
    console.log(`  📸 找到 ${productImages.length} 个产品图片元素`);

    if (productImages.length > 0) {
      testResults.passed++;
      testResults.details.push({
        test: 'DOM图片元素',
        status: 'pass',
        count: productImages.length
      });

      // 检查前5个图片
      console.log(`  📋 前5个图片元素:`);
      Array.from(productImages).slice(0, 5).forEach((img, i) => {
        const src = img.src.substring(img.src.lastIndexOf('/'));
        const loaded = img.complete && img.naturalWidth > 0;
        console.log(`    ${i + 1}. ${src} - ${loaded ? '✅' : '❌'} ${loaded ? img.naturalWidth + 'x' + img.naturalHeight : '未加载'}`);
      });
    } else {
      console.log(`  ⚠️  未找到产品图片元素`);
      testResults.warnings++;
      testResults.details.push({
        test: 'DOM图片元素',
        status: 'warning',
        message: '未找到图片元素'
      });
    }
  }

  // 测试4: 检查React应用
  function testReactApp() {
    console.log('\n⚛️  测试4: React应用状态');

    const root = document.getElementById('root');
    if (root) {
      console.log('  ✅ React根元素存在');
      console.log(`  📦 子元素数量: ${root.children.length}`);
      testResults.passed++;
      testResults.details.push({
        test: 'React根元素',
        status: 'pass'
      });
    } else {
      console.log('  ❌ 未找到React根元素');
      testResults.failed++;
      testResults.details.push({
        test: 'React根元素',
        status: 'fail'
      });
    }
  }

  // 测试5: 网络请求分析
  async function testNetworkRequests() {
    console.log('\n🌐 测试5: 网络请求分析');

    const tests = [
      { name: '映射表', url: '/data/product-image-map.json' },
      { name: '产品图片', url: targetImage },
      { name: '默认SVG', url: '/images/products/default-pcr.svg' }
    ];

    for (const test of tests) {
      try {
        const response = await fetch(test.url, { method: 'HEAD' });
        const size = response.headers.get('content-length');
        const sizeKB = size ? (size / 1024).toFixed(2) : 'N/A';

        if (response.ok) {
          console.log(`  ✅ ${test.name}: ${response.status} (${sizeKB}KB)`);
          testResults.passed++;
          testResults.details.push({
            test: test.name + '网络请求',
            status: 'pass',
            status_code: response.status,
            size: sizeKB + 'KB'
          });
        } else {
          console.log(`  ❌ ${test.name}: ${response.status}`);
          testResults.failed++;
          testResults.details.push({
            test: test.name + '网络请求',
            status: 'fail',
            status_code: response.status
          });
        }
      } catch (error) {
        console.log(`  ❌ ${test.name}: ${error.message}`);
        testResults.failed++;
        testResults.details.push({
          test: test.name + '网络请求',
          status: 'fail',
          error: error.message
        });
      }
    }
  }

  // 测试6: 性能指标
  function testPerformance() {
    console.log('\n🚀 测试6: 性能指标');

    const timing = performance.timing;
    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;

    console.log(`  ⏱️  页面加载时间: ${pageLoadTime}ms`);
    console.log(`  ⏱️  DOM就绪时间: ${domReadyTime}ms`);

    if (pageLoadTime < 2000) {
      console.log(`  ✅ 页面加载时间优秀 (< 2000ms)`);
      testResults.passed++;
    } else if (pageLoadTime < 3000) {
      console.log(`  ⚠️  页面加载时间一般 (2000-3000ms)`);
      testResults.warnings++;
    } else {
      console.log(`  ❌ 页面加载时间较慢 (> 3000ms)`);
      testResults.failed++;
    }

    // 内存使用
    if (performance.memory) {
      const usedJSHeapSize = performance.memory.usedJSHeapSize / 1024 / 1024;
      console.log(`  💾 内存使用: ${usedJSHeapSize.toFixed(2)}MB`);
    }
  }

  // 生成测试报告
  function generateReport() {
    console.log('\n========================================');
    console.log('📊 测试报告');
    console.log('========================================\n');

    const total = testResults.passed + testResults.failed + testResults.warnings;
    const passRate = ((testResults.passed / total) * 100).toFixed(2);

    console.log(`✅ 通过: ${testResults.passed}`);
    console.log(`⚠️  警告: ${testResults.warnings}`);
    console.log(`❌ 失败: ${testResults.failed}`);
    console.log(`📋 总计: ${total}`);
    console.log(`📈 通过率: ${passRate}%`);

    if (testResults.failed === 0 && testResults.warnings === 0) {
      console.log('\n🎉 所有测试通过！产品详情页正常。');
    } else {
      console.log('\n⚠️  发现问题，请查看上述详细信息。');
    }

    // 输出详细结果
    console.log('\n📝 详细测试结果:');
    testResults.details.forEach((detail, index) => {
      const icon = detail.status === 'pass' ? '✅' : detail.status === 'fail' ? '❌' : '⚠️';
      console.log(`  ${index + 1}. ${icon} ${detail.test}`);
      console.log(`     状态: ${detail.status.toUpperCase()}`);
      Object.entries(detail).forEach(([key, value]) => {
        if (key !== 'test' && key !== 'status') {
          console.log(`     ${key}: ${value}`);
        }
      });
    });

    // 导出报告
    const report = {
      timestamp: new Date().toISOString(),
      targetSKU: targetSKU,
      results: testResults,
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    console.log('\n========================================');
    console.log('📥 导出报告');
    console.log('========================================\n');

    console.log('💾 JSON格式的报告:');
    console.log(JSON.stringify(report, null, 2));
    console.log('\n💾 复制上述JSON并保存为文件');

    return report;
  }

  // 主测试流程
  async function runTests() {
    console.log('开始执行浏览器端测试...\n');

    try {
      // 执行所有测试
      await testMappingLoad();
      await testImageLoad(targetImage, '产品图片加载');
      await testImageLoad('/images/products/default-pcr.svg', '默认SVG加载');
      testDOMElements();
      testReactApp();
      await testNetworkRequests();
      testPerformance();

      // 生成报告
      const report = generateReport();

      console.log('\n========================================\n');

      return report;
    } catch (error) {
      console.error('❌ 测试执行失败:', error);
      testResults.failed++;
      throw error;
    }
  }

  // 运行测试
  runTests()
    .then(report => {
      console.log('✅ 测试完成！');
    })
    .catch(error => {
      console.error('❌ 测试失败:', error);
    });

})();
