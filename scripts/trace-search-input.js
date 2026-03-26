// 追踪搜索输入框的问题
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 追踪搜索输入框问题...\n');

// 读取App.jsx
const appFilePath = path.join(__dirname, '../src/App.jsx');
const appContent = fs.readFileSync(appFilePath, 'utf8');

console.log('1️⃣ 检查searchTerm状态定义...');

// 查找searchTerm的useState定义
const useStateMatch = appContent.match(/const \[searchTerm, setSearchTerm\] = useState\(['"](.*)['"]\);/);
if (useStateMatch) {
  console.log(`✅ 找到searchTerm定义: useState('${useStateMatch[1]}')`);
  console.log(`   初始值: "${useStateMatch[1]}"`);
  console.log(`   类型: "${typeof useStateMatch[1]}"`);
} else {
  console.log('❌ 未找到searchTerm的定义');
}

console.log('\n2️⃣ 检查输入框实现...');

// 查找搜索输入框
const inputMatch = appContent.match(/<input[^>]*value=\{searchTerm\}[^>]*onChange=\{[^}]*\}[^>]*>/);
if (inputMatch) {
  console.log('✅ 找到搜索输入框:');
  console.log(`   ${inputMatch[0]}`);
} else {
  console.log('❌ 未找到搜索输入框');
}

// 查找onChange处理
const onChangeMatch = appContent.match(/onChange=\{(e) => setSearchTerm\(e\.target\.value\)\}/);
if (onChangeMatch) {
  console.log('✅ 找到onChange处理:');
  console.log(`   onChange={(e) => setSearchTerm(e.target.value)}`);
} else {
  console.log('❌ 未找到标准的onChange处理');
  // 尝试查找其他onChange实现
  const allOnChange = appContent.matchAll(/onChange=\{[^}]*\}/g);
  console.log('\n   所有onChange事件:');
  let idx = 1;
  for (const match of allOnChange) {
    console.log(`   ${idx}. ${match[0]}`);
    idx++;
  }
}

console.log('\n3️⃣ 检查filteredProducts计算...');

// 查找filteredProducts的useMemo依赖
const useMemoMatch = appContent.match(/}, \[([^}]+)\];\s*\/\/ filteredProducts/);
if (useMemoMatch) {
  const deps = useMemoMatch[1].split(',').map(d => d.trim());
  console.log('✅ 找到filteredProducts依赖:');
  deps.forEach(dep => console.log(`   - ${dep}`));
  
  if (deps.includes('searchTerm')) {
    console.log('   ✅ searchTerm在依赖列表中');
  } else {
    console.log('   ❌ searchTerm不在依赖列表中（这是问题所在！）');
  }
}

console.log('\n4️⃣ 模拟可能的错误场景...');

console.log('\n场景1: searchTerm被设置为非字符串');
console.log('如果searchTerm被设置为null、undefined或数字，toLowerCase()会失败');
console.log('示例:');
console.log('  searchTerm = null');
console.log('  term = searchTerm.toLowerCase()  ❌ 错误: null.toLowerCase is not a function');

console.log('\n场景2: 产品数据包含异常值');
console.log('如果产品的description是对象或数组，typeof检查会失败');

console.log('\n5️⃣ 检查是否有其他地方修改searchTerm...');

const setSearchTermCalls = (appContent.match(/setSearchTerm\([^)]*\)/g) || []);
console.log(`找到 ${setSearchTermCalls.length} 个setSearchTerm调用:`);
setSearchTermCalls.forEach((call, idx) => {
  console.log(`  ${idx + 1}. ${call}`);
});

console.log('\n6️⃣ 生成修复建议...');

console.log('\n建议修复方案:');
console.log('1. 确保searchTerm始终是字符串类型:');
console.log('   <input');
console.log('     value={searchTerm || ""}');
console.log('     onChange={(e) => setSearchTerm(e.target.value || "")}');
console.log('   />');

console.log('\n2. 在filteredProducts计算中添加额外的null检查:');
console.log('   if (searchTerm && typeof searchTerm === "string") {');

console.log('\n3. 在allProducts初始化时清理数据:');
console.log('   allProducts.forEach(p => {');
console.log('     p.description = typeof p.description === "string" ? p.description : "";');
console.log('     p.brandSku = typeof p.brandSku === "string" ? p.brandSku : "";');
console.log('   });');

console.log('\n7️⃣ 创建修复补丁...');
