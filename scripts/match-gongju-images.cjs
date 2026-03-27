/**
 * 工具酶图片匹配脚本
 *
 * 功能：
 * 1. 解析 public/images/products/工具酶/ 下的所有图片文件名
 * 2. 提取 SKU，匹配 all-products.json 中的现有产品
 * 3. 新增缺少的产品到 all-products.json
 * 4. 更新 product-image-map.json（matchType: "exact"）
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT, 'src/data/all-products.json');
const IMAGE_MAP_FILE = path.join(ROOT, 'src/data/product-image-map.json');
const IMAGE_DIR = path.join(ROOT, 'public/images/products/工具酶');

// 读取现有数据
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
const imageMap = JSON.parse(fs.readFileSync(IMAGE_MAP_FILE, 'utf8'));

// 获取图片文件列表
const imageFiles = fs.readdirSync(IMAGE_DIR).filter(f => f.endsWith('.jpg'));

console.log(`找到 ${imageFiles.length} 个图片文件\n`);

/**
 * 从文件名提取 SKU
 * 格式：{SKU}{spec单位}_{酶名称}_NEW.jpg
 * 例：BSDT0120-1mg_Sortase_NEW.jpg → SKU: BSDT0120-1
 *     BSDT80405-100KU_EndoH_NEW.jpg → SKU: BSDT80405-100
 *     BSDT80602-0.2mg_Hyaluronidase_NEW.jpg → SKU: BSDT80602-0.2
 */
function extractSkuFromFilename(filename) {
  // 去掉 _NEW.jpg 后缀
  const base = filename.replace(/_NEW\.jpg$/i, '');
  // 取第一个 _ 前的部分（即 SKU+spec）
  const skuWithSpec = base.split('_')[0];
  // 去掉单位：mg, ul, KU, ug, U, T（但要保留数字和小数点和x）
  // 策略：找 SKU 中的数字部分，去掉后面的字母单位
  // SKU 格式：BSDT{数字}-{数字}{单位}
  const match = skuWithSpec.match(/^([A-Z]+\d+(?:[A-Z]\d+)?)-(\d+(?:\.\d+)?(?:x\d+)?)/i);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  // 如果没有 - 分隔，直接返回去除单位后的结果
  return skuWithSpec.replace(/[a-z]+$/i, '');
}

// 特殊映射：文件名SKU → 数据库SKU（当命名不完全一致时）
const SKU_OVERRIDES = {
  'BSDTY0320-2': 'BSDTY0320-02',    // 文件 2ug → 数据库 02
  'BSDTY0320-5': 'BSDTY0320-05',    // 文件 5ug → 数据库 05
  'BSDTY0350-1': 'BSDTY0350-01',    // 文件 1mg → 数据库 01
  'BSDTY0350-5': 'BSDTY0350-05',    // 文件 5mg → 数据库 05
};

// 酶名称中文映射（用于新增产品）
const ENZYME_NAMES = {
  'EndoH': 'EndoH内切糖苷酶H',
  'IdeS': 'IdeS蛋白酶',
  'IdeZ': 'IdeZ蛋白酶',
  'GluC': '重组Glu-C蛋白酶,冻干',
  'OGlycosidase': 'O糖蛋白酶',
  'Hyaluronidase': '重组透明质酸酶（冻干）',
  'ASPN': 'ASP-N酶',
  'Trypsin': '重组胰蛋白酶   (质谱级,冻干)',
};

// 价格参考（参考同产品其他规格的单价来估算）
const PRICE_REFS = {
  'BSDT80405': 800,   // EndoH
  'BSDT80406': 1200,  // IdeS
  'BSDT80407': 700,   // IdeZ
  'BSDT80409': 1500,  // GluC
  'BSDT80423': 1000,  // OGlycosidase
  'BSDT80602': 1200,  // Hyaluronidase
  'BSDTY0320': 1500,  // ASPN
};

// 规格单位映射
function getSpecFromFilename(filename) {
  const base = filename.replace(/_NEW\.jpg$/i, '');
  const skuWithSpec = base.split('_')[0];
  const match = skuWithSpec.match(/-(\d+(?:\.\d+)?(?:x\d+)?)(mg|ul|KU|ug|U|T|MG)?$/i);
  if (!match) return skuWithSpec.split('-')[1] || '';
  const num = match[1];
  const unit = match[2] || '';
  // 标准化单位
  const unitMap = {
    'mg': 'mg', 'MG': 'mg', 'ul': 'ul', 'UL': 'ul',
    'KU': 'KU', 'ku': 'KU',
    'ug': 'µg', 'UG': 'µg',
    'U': 'U', 'T': 'T/PK'
  };
  const normalUnit = unitMap[unit] || unit;
  return num + (normalUnit ? normalUnit : '');
}

const newProducts = [];
const imageMapUpdates = {};
const matchResults = [];

for (const file of imageFiles) {
  const rawSku = extractSkuFromFilename(file);
  const dbSku = SKU_OVERRIDES[rawSku] || rawSku;
  const imagePath = `工具酶/${file}`;

  // 从文件名提取酶名称
  const parts = file.replace(/_NEW\.jpg$/i, '').split('_');
  const enzymePart = parts[1] || '';

  // 查找现有产品
  const existing = products.find(p => p.sku === dbSku);

  if (existing) {
    matchResults.push({ file, sku: dbSku, status: '✓ 匹配', name: existing.name });
  } else {
    // 需要新增产品
    const baseCode = dbSku.split('-')[0];
    const spec = getSpecFromFilename(file);
    const chineseName = ENZYME_NAMES[enzymePart] || enzymePart;
    const price = PRICE_REFS[baseCode] || 1000;

    // 参考同类产品的 cat/sub
    const sameBase = products.find(p => p.sku && p.sku.startsWith(baseCode));
    const cat = sameBase ? sameBase.cat : '质控分析工具酶';
    const sub = sameBase ? sameBase.sub : '工具酶';

    const newProduct = {
      cat, sub, sku: dbSku,
      name: chineseName,
      spec,
      price,
      brand: 'Booster'
    };
    newProducts.push(newProduct);
    matchResults.push({ file, sku: dbSku, status: '+ 新增', name: chineseName });
  }

  // 更新图片映射（注意：用文件名中的原始SKU部分，但映射到真正的数据库SKU）
  imageMapUpdates[dbSku] = {
    image: imagePath,
    matchType: 'exact',
    category: '工具酶',
    description: (products.find(p => p.sku === dbSku) || {}).name || enzymePart,
    skuMatch: dbSku
  };
}

// 打印匹配结果
console.log('匹配结果：');
matchResults.forEach(r => console.log(`  ${r.status} ${r.sku.padEnd(20)} ${r.name}`));

console.log(`\n现有产品匹配: ${matchResults.filter(r => r.status.includes('✓')).length} 个`);
console.log(`需要新增产品: ${newProducts.length} 个`);

if (newProducts.length > 0) {
  console.log('\n新增产品：');
  newProducts.forEach(p => console.log(`  ${p.sku} | ${p.name} | ${p.spec}`));
}

// ── 写入文件 ──

// 1. 更新 all-products.json（在末尾追加新产品）
if (newProducts.length > 0) {
  const updated = [...products, ...newProducts];
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  console.log(`\n✅ all-products.json 已更新，新增 ${newProducts.length} 条，共 ${updated.length} 条`);
}

// 2. 更新 product-image-map.json
let updateCount = 0;
for (const [sku, entry] of Object.entries(imageMapUpdates)) {
  const existing = imageMap[sku];
  if (!existing || existing.matchType !== 'exact') {
    imageMap[sku] = entry;
    updateCount++;
  } else {
    console.log(`  ⚠️  跳过 ${sku}（已有 exact 匹配）`);
  }
}

fs.writeFileSync(IMAGE_MAP_FILE, JSON.stringify(imageMap, null, 2), 'utf8');
console.log(`✅ product-image-map.json 已更新，新增/更新 ${updateCount} 条`);

console.log('\n🎉 完成！请运行 npm run dev 验证本地显示是否正常。');
