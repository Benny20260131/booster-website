// 浏览器端信息收集脚本
// 将此脚本添加到浏览器控制台中运行

(function() {
  console.log('========================================');
  console.log('🔍 浏览器诊断信息收集');
  console.log('========================================\n');

  const diagnostic = {
    timestamp: new Date().toLocaleString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width} x ${window.screen.height}`,
    viewportSize: `${window.innerWidth} x ${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio,
    online: navigator.onLine,
    cookiesEnabled: navigator.cookieEnabled,
    currentURL: window.location.href
  };

  console.log('📊 系统信息:');
  Object.entries(diagnostic).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  // 测试映射表加载
  console.log('\n📋 测试映射表加载...');
  fetch('/data/product-image-map.json')
    .then(response => {
      console.log(`  状态码: ${response.status} ${response.statusText}`);
      console.log(`  Content-Type: ${response.headers.get('content-type')}`);
      console.log(`  Content-Length: ${response.headers.get('content-length')} bytes`);
      return response.json();
    })
    .then(data => {
      console.log(`  ✅ 映射表加载成功`);
      console.log(`  SKU总数: ${Object.keys(data).length}`);

      const targetSKU = 'BSD-HC-PCR-0P1ML-001';
      if (data[targetSKU]) {
        console.log(`\n  目标SKU (${targetSKU}):`);
        console.log(JSON.stringify(data[targetSKU], null, 4));
      } else {
        console.log(`\n  ❌ 未找到目标SKU: ${targetSKU}`);
      }
    })
    .catch(error => {
      console.log(`  ❌ 映射表加载失败: ${error.message}`);
    });

  // 测试图片加载
  console.log('\n🖼️  测试图片加载...');
  const testImages = [
    {
      sku: 'BSD-HC-PCR-0P1ML-001',
      url: '/images/products/分子生物类_0.1mL无裙边96孔PCR板_5.jpg',
      description: '目标产品图片'
    },
    {
      sku: 'default',
      url: '/images/products/default-pcr.svg',
      description: '默认SVG图标'
    }
  ];

  testImages.forEach(img => {
    const testImg = new Image();
    testImg.onload = () => {
      console.log(`  ✅ ${img.description} (${img.sku})`);
      console.log(`     URL: ${img.url}`);
      console.log(`     尺寸: ${testImg.naturalWidth}x${testImg.naturalHeight}px`);
    };
    testImg.onerror = () => {
      console.log(`  ❌ ${img.description} (${img.sku})`);
      console.log(`     URL: ${img.url}`);
      console.log(`     错误: 图片加载失败`);
    };
    testImg.src = img.url;
  });

  // 检查React状态
  console.log('\n⚛️  React状态检查...');
  setTimeout(() => {
    // 尝试查找React组件
    const appElement = document.querySelector('#root > div');
    if (appElement) {
      console.log('  ✅ React应用已挂载');
      console.log(`     根元素包含: ${appElement.children.length}个子元素`);
    } else {
      console.log('  ❌ React应用未找到');
    }

    // 查找ProductImage组件
    const productImages = document.querySelectorAll('img[src^="/images/products/"]');
    console.log(`  📸 找到 ${productImages.length} 个产品图片元素`);

    if (productImages.length > 0) {
      console.log('\n  前5个产品图片:');
      Array.from(productImages).slice(0, 5).forEach((img, i) => {
        console.log(`    ${i + 1}. ${img.alt}: ${img.src.substring(0, 60)}...`);
        console.log(`       加载状态: ${img.complete ? (img.naturalWidth > 0 ? '成功' : '失败') : '加载中'}`);
        console.log(`       自然尺寸: ${img.naturalWidth}x${img.naturalHeight}`);
      });
    }

    console.log('\n========================================');
    console.log('诊断完成');
    console.log('========================================\n');
  }, 2000);

})();
