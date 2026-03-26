// 修复App.jsx中的搜索逻辑
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 修复App.jsx中的搜索逻辑...\n');

const appFilePath = path.join(__dirname, '../src/App.jsx');
let appContent = fs.readFileSync(appFilePath, 'utf8');

// 查找并替换有问题的搜索逻辑
const oldSearchLogic = `  const filteredProducts = useMemo(() => {
    let products = allProducts;
    
    if (activeCategory) {
      products = products.filter(p => p._category === activeCategory);
      
      if (activeApplication) {
        products = products.filter(p => p._application === activeApplication);
        
        if (activeSubCategory) {
          products = products.filter(p => p._subCategory === activeSubCategory);
        }
      }
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      products = products.filter(p =>
        p.description?.toLowerCase().includes(term) ||
        p.brandSku?.toLowerCase().includes(term) ||
        p.specification?.toLowerCase().includes(term)
      );
    }
    
    return products;
  }, [activeCategory, activeApplication, activeSubCategory, searchTerm, allProducts]);`;

const newSearchLogic = `  const filteredProducts = useMemo(() => {
    let products = allProducts;
    
    if (activeCategory) {
      products = products.filter(p => p._category === activeCategory);
      
      if (activeApplication) {
        products = products.filter(p => p._application === activeApplication);
        
        if (activeSubCategory) {
          products = products.filter(p => p._subCategory === activeSubCategory);
        }
      }
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      products = products.filter(p => {
        const description = typeof p.description === 'string' ? p.description.toLowerCase() : '';
        const brandSku = typeof p.brandSku === 'string' ? p.brandSku.toLowerCase() : '';
        const specification = typeof p.specification === 'string' ? p.specification.toLowerCase() : '';
        return description.includes(term) || brandSku.includes(term) || specification.includes(term);
      });
    }
    
    return products;
  }, [activeCategory, activeApplication, activeSubCategory, searchTerm, allProducts]);`;

// 检查是否找到旧逻辑
if (appContent.includes(oldSearchLogic)) {
  console.log('✅ 找到需要修复的搜索逻辑');
  appContent = appContent.replace(oldSearchLogic, newSearchLogic);
  fs.writeFileSync(appFilePath, appContent, 'utf8');
  console.log('✅ 搜索逻辑已修复');
  console.log('\n修复内容:');
  console.log('  - 添加类型检查，确保字段是字符串类型');
  console.log('  - 将undefined/null转换为空字符串');
  console.log('  - 防止toLowerCase()和includes()方法调用失败');
} else {
  console.log('⚠️  未找到需要修复的搜索逻辑，可能已经修复过');
}

// 创建修复说明文档
const fixReport = {
  timestamp: new Date().toISOString(),
  issue: '搜索栏TypeError: description?.toLowerCase is not a function',
  rootCause: '产品数据中存在undefined/null字段，导致toLowerCase()调用失败',
  affectedProducts: {
    missingBrandSku: 8,
    missingDescription: 98,
    missingSpecification: 3141
  },
  fixApplied: '添加类型检查，确保只有字符串才调用toLowerCase()',
  oldCode: oldSearchLogic,
  newCode: newSearchLogic,
  testingInstructions: [
    '1. 访问 http://localhost:5173/',
    '2. 点击"产品中心"',
    '3. 在搜索框输入: PCR、BSD-HC、孔板、0.1',
    '4. 点击"搜索"按钮',
    '5. 验证搜索结果是否正常显示'
  ]
};

const reportPath = path.join(__dirname, '../search-fix-report.json');
fs.writeFileSync(reportPath, JSON.stringify(fixReport, null, 2), 'utf8');
console.log(`\n📄 修复报告已保存: ${reportPath}`);
