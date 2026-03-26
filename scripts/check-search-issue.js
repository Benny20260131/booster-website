// 搜索功能问题诊断脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('='.repeat(80));
console.log('🔍 搜索功能问题诊断');
console.log('='.repeat(80));

// 1. 加载产品数据
console.log('\n1️⃣ 加载产品数据...');
const productsPath = path.join(__dirname, '../src/products_new.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
console.log(`   ✅ 产品数据加载成功`);
console.log(`   总分类数: ${productsData.categories.length}`);

// 2. 生成allProducts（模拟App.jsx的逻辑）
console.log('\n2️⃣ 生成allProducts...');
const allProducts = [];
productsData.categories.forEach(category => {
  category.subCategories.forEach(subCat => {
    subCat.categories.forEach(cat => {
      cat.products.forEach(product => {
        allProducts.push({
          ...product,
          _category: category.name,
          _application: subCat.name,
          _subCategory: cat.name
        });
      });
    });
  });
});
console.log(`   ✅ allProducts生成完成: ${allProducts.length} 个产品`);

// 3. 检查产品数据结构
console.log('\n3️⃣ 检查产品数据结构...');
const sampleProducts = allProducts.slice(0, 3);
sampleProducts.forEach((prod, idx) => {
  console.log(`   产品 ${idx + 1}:`);
  console.log(`     brandSku: ${prod.brandSku || '❌ 不存在'}`);
  console.log(`     description: ${prod.description ? (prod.description.substring(0, 50) + '...') : '❌ 不存在'}`);
  console.log(`     specification: ${prod.specification || '❌ 不存在'}`);
  console.log(`     _category: ${prod._category || '❌ 不存在'}`);
  console.log(`     _application: ${prod._application || '❌ 不存在'}`);
  console.log(`     _subCategory: ${prod._subCategory || '❌ 不存在'}`);
});

// 4. 统计关键字段的存在性
console.log('\n4️⃣ 统计关键字段存在性...');
const fieldStats = {
  brandSku: 0,
  description: 0,
  specification: 0,
  _category: 0,
  _application: 0,
  _subCategory: 0
};

allProducts.forEach(prod => {
  if (prod.brandSku) fieldStats.brandSku++;
  if (prod.description) fieldStats.description++;
  if (prod.specification) fieldStats.specification++;
  if (prod._category) fieldStats._category++;
  if (prod._application) fieldStats._application++;
  if (prod._subCategory) fieldStats._subCategory++;
});

Object.entries(fieldStats).forEach(([field, count]) => {
  const percentage = ((count / allProducts.length) * 100).toFixed(1);
  console.log(`   ${field}: ${count}/${allProducts.length} (${percentage}%)`);
});

// 5. 测试搜索功能
console.log('\n5️⃣ 测试搜索功能...');
const testCases = [
  { term: 'PCR', desc: '常见关键词' },
  { term: 'BSD-HC', desc: '货号前缀' },
  { term: '孔板', desc: '中文关键词' },
  { term: '0.1', desc: '数字关键词' },
  { term: 'BSD-HC-PCR-0P1ML-001', desc: '完整货号' }
];

testCases.forEach(test => {
  const term = test.term.toLowerCase();
  const results = allProducts.filter(p => {
    const desc = typeof p.description === 'string' ? p.description.toLowerCase() : '';
    const sku = typeof p.brandSku === 'string' ? p.brandSku.toLowerCase() : '';
    const spec = typeof p.specification === 'string' ? p.specification.toLowerCase() : '';
    return desc.includes(term) || sku.includes(term) || spec.includes(term);
  });
  
  console.log(`   搜索 "${test.term}" (${test.desc}): 找到 ${results.length} 个结果`);
  
  if (results.length > 0 && results.length <= 5) {
    console.log(`     匹配的产品:`);
    results.slice(0, 3).forEach(r => {
      console.log(`       - ${r.brandSku}`);
    });
  }
});

// 6. 检查目标产品BSD-HC-PCR-0P1ML-001
console.log('\n6️⃣ 检查目标产品BSD-HC-PCR-0P1ML-001...');
const targetProduct = allProducts.find(p => p.brandSku === 'BSD-HC-PCR-0P1ML-001');
if (targetProduct) {
  console.log('   ✅ 找到目标产品');
  console.log(`   brandSku: ${targetProduct.brandSku}`);
  console.log(`   description: ${targetProduct.description}`);
  console.log(`   specification: ${targetProduct.specification}`);
  console.log(`   _category: ${targetProduct._category}`);
  console.log(`   _application: ${targetProduct._application}`);
  console.log(`   _subCategory: ${targetProduct._subCategory}`);
  
  // 测试搜索该产品
  const searchTerms = ['PCR', '0.1ML', 'BSD-HC-PCR', 'BSD-HC-PCR-0P1ML-001'];
  console.log('   搜索测试:');
  searchTerms.forEach(term => {
    const lowerTerm = term.toLowerCase();
    const desc = typeof targetProduct.description === 'string' ? targetProduct.description.toLowerCase() : '';
    const sku = typeof targetProduct.brandSku === 'string' ? targetProduct.brandSku.toLowerCase() : '';
    const spec = typeof targetProduct.specification === 'string' ? targetProduct.specification.toLowerCase() : '';
    const match = desc.includes(lowerTerm) || sku.includes(lowerTerm) || spec.includes(lowerTerm);
    console.log(`     "${term}": ${match ? '✅ 匹配' : '❌ 不匹配'}`);
  });
} else {
  console.log('   ❌ 未找到目标产品BSD-HC-PCR-0P1ML-001');
}

// 7. 识别潜在问题
console.log('\n7️⃣ 识别潜在问题...');
const issues = [];

// 检查undefined字段
if (fieldStats.brandSku < allProducts.length) {
  issues.push(`❌ ${allProducts.length - fieldStats.brandSku} 个产品缺少brandSku字段`);
}
if (fieldStats.description < allProducts.length) {
  issues.push(`⚠️  ${allProducts.length - fieldStats.description} 个产品缺少description字段`);
}
if (fieldStats.specification < allProducts.length) {
  issues.push(`⚠️  ${allProducts.length - fieldStats.specification} 个产品缺少specification字段`);
}

// 测试搜索空值
const emptySearch = allProducts.filter(p => {
  const desc = typeof p.description === 'string' ? p.description.toLowerCase() : '';
  const sku = typeof p.brandSku === 'string' ? p.brandSku.toLowerCase() : '';
  const spec = typeof p.specification === 'string' ? p.specification.toLowerCase() : '';
  return desc.includes('') || sku.includes('') || spec.includes('');
});
console.log(`   空搜索结果: ${emptySearch.length} 个产品`);

if (issues.length === 0) {
  console.log('   ✅ 未发现明显问题');
} else {
  console.log('   发现以下问题:');
  issues.forEach(issue => console.log(`     ${issue}`));
}

// 8. 生成诊断报告
console.log('\n8️⃣ 诊断报告总结...');
console.log('='.repeat(80));
console.log('诊断结果:');
console.log(`- 产品总数: ${allProducts.length}`);
console.log(`- 字段完整性:`);
Object.entries(fieldStats).forEach(([field, count]) => {
  const percentage = ((count / allProducts.length) * 100).toFixed(1);
  const status = percentage === '100.0' ? '✅' : percentage > '90.0' ? '⚠️' : '❌';
  console.log(`  ${status} ${field}: ${count} (${percentage}%)`);
});
console.log(`- 搜索功能: ${issues.length === 0 ? '✅ 正常' : '⚠️  存在潜在问题'}`);
console.log('='.repeat(80));

// 9. 导出详细数据
const reportPath = path.join(__dirname, '../search-diagnostic-report.json');
const report = {
  timestamp: new Date().toISOString(),
  totalProducts: allProducts.length,
  fieldStats: fieldStats,
  testCases: testCases.map(test => {
    const term = test.term.toLowerCase();
    const results = allProducts.filter(p => {
      const desc = typeof p.description === 'string' ? p.description.toLowerCase() : '';
      const sku = typeof p.brandSku === 'string' ? p.brandSku.toLowerCase() : '';
      const spec = typeof p.specification === 'string' ? p.specification.toLowerCase() : '';
      return desc.includes(term) || sku.includes(term) || spec.includes(term);
    });
    return {
      term: test.term,
      description: test.desc,
      resultCount: results.length
    };
  }),
  targetProduct: targetProduct,
  issues: issues
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`\n📄 详细报告已保存: ${reportPath}`);
