/**
 * scrape-gsbio-images.js
 * 爬取 gsbio.com.cn 产品图片，按品类关键词匹配 booster SKU，
 * 下载图片到 public/images/products/gsbio/，并更新 product-image-map.json
 *
 * 用法：
 *   node scripts/scrape-gsbio-images.js              # 全量运行
 *   node scripts/scrape-gsbio-images.js --dry-run    # 只分析不下载
 *   node scripts/scrape-gsbio-images.js --category=547660  # 只跑指定分类
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── CLI 参数 ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ONLY_CAT = (args.find(a => a.startsWith('--category=')) || '').replace('--category=', '');
const DELAY_MS = 900; // 请求间隔（ms）

// ── 路径配置 ────────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'products', 'gsbio');
const MAP_PATH = path.join(ROOT, 'src', 'data', 'product-image-map.json');
const PRODUCTS_PATH = path.join(ROOT, 'src', 'products.json');

// ── gsbio 分类 ID → booster sub 字段映射 ────────────────────────────────────
const CATEGORIES = [
  { id: '547660', gsbioName: '普通吸头',   boosterSub: '吸头' },
  { id: '547661', gsbioName: '机械吸头',   boosterSub: '吸头' },
  { id: '547655', gsbioName: 'PCR管',      boosterSub: 'PCR管' },
  { id: '547656', gsbioName: 'PCR板',      boosterSub: 'PCR板' },
  { id: '547657', gsbioName: 'PCR封板膜',  boosterSub: 'PCR封板膜' },
  { id: '547658', gsbioName: '可拆酶标板', boosterSub: '酶标板' },
  { id: '547671', gsbioName: '深孔板',     boosterSub: '深孔板' },
  { id: '547672', gsbioName: '血清移液管', boosterSub: '移液管' },
  { id: '547673', gsbioName: '细菌培养皿', boosterSub: '培养皿' },
  { id: '547674', gsbioName: '保存管',     boosterSub: '保存管' },
  { id: '547675', gsbioName: '微量离心管', boosterSub: '离心管' },
  { id: '547676', gsbioName: '试剂瓶',     boosterSub: '试剂瓶' },
  { id: '668318', gsbioName: '细胞工厂',   boosterSub: '细胞工厂' },
  { id: '668319', gsbioName: '培养板',     boosterSub: '培养板' },
  { id: '668320', gsbioName: '培养皿',     boosterSub: '培养皿' },
  { id: '668321', gsbioName: '培养瓶',     boosterSub: '培养瓶' },
  { id: '668490', gsbioName: '磁珠类',     boosterSub: '磁珠' },
];

// ── HTTP fetch 工具（自动跟随跳转）──────────────────────────────────────────
function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
      },
      timeout: 20000,
    };
    const req = client.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        res.resume();
        resolve(fetchUrl(redirectUrl, maxRedirects - 1));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, url }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

// ── 下载二进制文件 ────────────────────────────────────────────────────────────
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) { resolve(false); return; } // 已存在，跳过
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://www.gsbio.com.cn/',
      },
    };
    client.get(url, options, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
        file.on('error', (e) => { fs.unlink(destPath, () => {}); reject(e); });
      } else {
        file.close();
        fs.unlink(destPath, () => {});
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
    }).on('error', (e) => {
      fs.unlink(destPath, () => {});
      reject(e);
    });
  });
}

// ── 延迟 ─────────────────────────────────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));

// ── HTML 解析工具 ─────────────────────────────────────────────────────────────
function extractProductLinks(html) {
  const links = [];
  const re = /href=['"](\/?ProductDetail\/\d+\.html)['"]/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (!links.includes(m[1])) links.push(m[1]);
  }
  return links;
}

function extractTotalPages(html) {
  // 匹配分页：href="/Product/319586.html?...PageNo=10"
  const re = /PageNo=(\d+)/g;
  let max = 1;
  let m;
  while ((m = re.exec(html)) !== null) {
    const n = parseInt(m[1]);
    if (n > max) max = n;
  }
  return max;
}

function extractProductInfo(html, url) {
  // 提取图片路径：details('...', '...', '/comdata/109884/product/{hash}_b.jpg', ...)
  const imgRe = /['"](\/comdata\/109884\/product\/[A-Za-z0-9_]+_b\.(jpg|png|webp|jpeg))['"]/i;
  const imgMatch = html.match(imgRe);

  // 面包屑导航提取产品名：首页>生物耗材>移液处理>深孔板>铝箔封板膜
  const breadcrumbRe = />([^<>]+)<\/a>\s*<[^>]*>([^<>]+)<\/[^>]*>\s*(?:addScript|var |$)/;

  // 提取标题（h1 或 页面内文字）
  const titleRe = /<h1[^>]*>([^<]+)<\/h1>/;
  const titleMatch = html.match(titleRe);

  // 从面包屑提取末级产品名
  const bcRe = /首页.*?>\s*([^<>\|·]+)\s*(?:addScript|details\()/s;
  const bcMatch = html.match(bcRe);

  // 提取产品型号表格（产品型号列）
  const modelRe = /<td[^>]*>\s*((?:[A-Z]{1,4}[\dA-Z\-]+))\s*<\/td>/g;
  const models = [];
  let mm;
  while ((mm = modelRe.exec(html)) !== null) {
    if (mm[1].length < 20) models.push(mm[1].trim());
  }

  // 提取产品描述文本（过滤脚本内容，取中文段落）
  const textRe = /产品特点[^<]*▪([^<]+)/;
  const textMatch = html.match(textRe);

  // 从面包屑最后一段获得产品名
  const lastBcRe = />([^<>\n]+)<\/[^>]+>\s*(?:addScript|var lang|$)/;
  const lastBcMatch = html.match(lastBcRe);

  const name = titleMatch?.[1]?.trim()
    || lastBcMatch?.[1]?.trim()
    || '未知产品';

  return {
    imgPath: imgMatch ? imgMatch[1] : null,
    imgUrl: imgMatch ? `https://cdn.img-sys.com${imgMatch[1]}` : null,
    name: name.replace(/[\n\r\t]/g, '').trim(),
    models: [...new Set(models)].slice(0, 10),
    description: textMatch?.[1]?.trim() || '',
    sourceUrl: url,
  };
}

// ── 产品数据加载（扁平化 products.json）─────────────────────────────────────
function loadBoosterProducts() {
  const raw = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const flat = []; // { sku, description, specification, sub, cat }

  for (const cat of raw.categories) {
    for (const subCat of (cat.subCategories || [])) {
      for (const sub2 of (subCat.categories || [])) {
        const subName = sub2.name; // e.g. "吸头"
        for (const p of (sub2.products || [])) {
          flat.push({
            sku: p.brandSku,
            description: p.description || '',
            specification: p.specification || '',
            sub: subName,
            cat: cat.name,
          });
        }
      }
    }
  }
  return flat;
}

// ── 关键词匹配评分 ─────────────────────────────────────────────────────────
function scoreMatch(boosterProduct, gsbioProduct) {
  const desc = (boosterProduct.description || '').toLowerCase();
  const spec = (boosterProduct.specification || '').toLowerCase();
  const gName = (gsbioProduct.name || '').toLowerCase();
  const gDesc = (gsbioProduct.description || '').toLowerCase();
  const combined = gName + ' ' + gDesc;

  let score = 0;

  // 容量匹配（最高权重）
  const volRe = /(\d+(?:\.\d+)?)\s*(?:ul|µl|ml|uL|μL|mL)/gi;
  let m;
  const boosterVols = new Set();
  while ((m = volRe.exec(desc + ' ' + spec)) !== null) boosterVols.add(m[1]);
  volRe.lastIndex = 0;
  const gsbioVols = new Set();
  while ((m = volRe.exec(combined)) !== null) gsbioVols.add(m[1]);

  for (const v of boosterVols) {
    if (gsbioVols.has(v)) score += 15;
  }

  // 规格特征关键词
  const featureKeywords = [
    ['带滤芯', 'filter', '滤芯'],
    ['无菌', '灭菌', 'sterile', '辐照'],
    ['透明', 'clear', 'transparent'],
    ['黄色', 'yellow'],
    ['蓝色', 'blue'],
    ['白色', 'white'],
    ['低吸附', 'low retention', 'low-retention'],
    ['带刻度', 'graduated', '刻度'],
    ['圆底', 'round bottom', '圆底'],
    ['V型底', 'v-bottom', 'V底'],
    ['无裙边', 'skirted', '裙边'],
    ['半裙边'],
    ['96', '384', '48', '24'],
    ['螺口', '盖', 'screw cap'],
    ['冻存管', '冻存'],
    ['可穿刺'],
    ['加长'],
  ];

  for (const synonyms of featureKeywords) {
    const inBooster = synonyms.some(k => desc.includes(k.toLowerCase()) || spec.includes(k.toLowerCase()));
    const inGsbio = synonyms.some(k => combined.includes(k.toLowerCase()));
    if (inBooster && inGsbio) score += 5;
  }

  // 规格包装匹配
  const packRe = /(\d+)\s*[\/个只枚]\s*[盒包]/;
  const bPack = spec.match(packRe);
  const gPack = (gsbioProduct.description || '').toLowerCase().match(packRe);
  if (bPack && gPack && bPack[1] === gPack[1]) score += 8;

  return score;
}

// ── 主流程 ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 gsbio 图片爬虫 ${DRY_RUN ? '[DRY RUN]' : ''}`);
  console.log(`目标图片目录: ${IMG_DIR}`);

  // 创建目录
  if (!DRY_RUN) fs.mkdirSync(IMG_DIR, { recursive: true });

  // 加载产品数据
  console.log('\n📦 加载 booster 产品数据...');
  const boosterProducts = loadBoosterProducts();
  console.log(`  共 ${boosterProducts.length} 个 SKU`);

  // 按 sub 分组
  const bySubCat = {};
  for (const p of boosterProducts) {
    if (!bySubCat[p.sub]) bySubCat[p.sub] = [];
    bySubCat[p.sub].push(p);
  }

  // 加载现有映射表
  const imageMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  let updatedCount = 0;
  let downloadedCount = 0;

  // 过滤要处理的分类
  const catsToProcess = ONLY_CAT
    ? CATEGORIES.filter(c => c.id === ONLY_CAT)
    : CATEGORIES;

  for (const cat of catsToProcess) {
    console.log(`\n📂 处理分类: ${cat.gsbioName} (${cat.id}) → booster: ${cat.boosterSub}`);

    const boosterSkus = bySubCat[cat.boosterSub] || [];
    if (boosterSkus.length === 0) {
      console.log(`  ⚠️  没有匹配的 booster SKU（sub="${cat.boosterSub}"），跳过`);
      continue;
    }
    console.log(`  对应 ${boosterSkus.length} 个 booster SKU`);

    // 1. 获取分类首页，确定总页数
    const listUrl = `http://www.gsbio.com.cn/Product/${cat.id}.html`;
    let firstPage;
    try {
      firstPage = await fetchUrl(listUrl);
      await delay(DELAY_MS);
    } catch (e) {
      console.error(`  ❌ 获取列表页失败: ${e.message}`);
      continue;
    }

    if (firstPage.status !== 200) {
      console.error(`  ❌ 列表页返回 ${firstPage.status}`);
      continue;
    }

    const totalPages = extractTotalPages(firstPage.body);
    console.log(`  共 ${totalPages} 页`);

    // 2. 收集所有产品详情页链接
    const detailLinks = extractProductLinks(firstPage.body);

    for (let pg = 2; pg <= Math.min(totalPages, 15); pg++) {
      try {
        const pageUrl = `http://www.gsbio.com.cn/Product/${cat.id}.html?ClassID=${cat.id}&responseModuleId=487136369&PageNo=${pg}`;
        const res = await fetchUrl(pageUrl);
        await delay(DELAY_MS);
        if (res.status === 200) {
          const links = extractProductLinks(res.body);
          for (const l of links) {
            if (!detailLinks.includes(l)) detailLinks.push(l);
          }
        }
      } catch (e) {
        console.error(`  ❌ 第 ${pg} 页失败: ${e.message}`);
      }
    }

    console.log(`  发现 ${detailLinks.length} 个产品详情页`);

    // 3. 爬取每个产品详情页
    for (const link of detailLinks) {
      const detailUrl = `http://www.gsbio.com.cn${link}`;
      let res;
      try {
        res = await fetchUrl(detailUrl);
        await delay(DELAY_MS);
      } catch (e) {
        console.error(`  ❌ ${link}: ${e.message}`);
        continue;
      }
      if (res.status !== 200) continue;

      const info = extractProductInfo(res.body, detailUrl);
      if (!info.imgUrl) {
        console.log(`  ⚠️  ${info.name}: 未找到图片`);
        continue;
      }

      // 4. 匹配 booster SKU
      const scored = boosterSkus.map(p => ({
        sku: p.sku,
        score: scoreMatch(p, info),
        product: p,
      })).filter(x => x.score > 5)
        .sort((a, b) => b.score - a.score);

      if (scored.length === 0) {
        console.log(`  ⏭️  ${info.name}: 无匹配 SKU（分数均≤5）`);
        continue;
      }

      // 图片文件名：{分类名}_{hash}.{ext}
      const imgHashMatch = info.imgPath.match(/\/([A-Za-z0-9_]+)_b\.(jpg|png|webp|jpeg)$/i);
      if (!imgHashMatch) continue;
      const imgFileName = `${cat.gsbioName}_${imgHashMatch[1]}.${imgHashMatch[2]}`;
      const localImgPath = path.join(IMG_DIR, imgFileName);
      const mapImgValue = `gsbio/${imgFileName}`;

      // 5. 下载图片
      if (!DRY_RUN) {
        try {
          const isNew = await downloadFile(info.imgUrl, localImgPath);
          if (isNew) {
            downloadedCount++;
            console.log(`  ✅ 下载: ${imgFileName}`);
          }
        } catch (e) {
          console.error(`  ❌ 下载失败 ${info.imgUrl}: ${e.message}`);
          continue;
        }
      }

      // 6. 更新映射（只更新 generic/category/? 类型，保留 exact/keyword）
      const TOP_N = Math.min(scored.length, 3); // 最多更新前3个匹配
      for (let i = 0; i < TOP_N; i++) {
        const { sku, score } = scored[i];
        const existing = imageMap[sku];
        const existingType = existing?.matchType;

        if (!existing || existingType === 'generic' || existingType === 'category' || !existingType) {
          imageMap[sku] = {
            image: mapImgValue,
            matchType: 'gsbio-crawl',
            category: cat.boosterSub,
            description: info.name,
            sourceUrl: detailUrl,
            matchScore: score,
          };
          updatedCount++;
          if (DRY_RUN) {
            console.log(`  [DRY] ${sku} (score=${score}) → ${mapImgValue}`);
          }
        }
      }
    }
  }

  // 7. 写回映射表
  if (!DRY_RUN && updatedCount > 0) {
    fs.writeFileSync(MAP_PATH, JSON.stringify(imageMap, null, 2), 'utf8');
    console.log(`\n✅ 映射表已更新，写入路径: ${MAP_PATH}`);
  }

  console.log('\n═══════════════════════════════════');
  console.log(`📊 运行结果:`);
  console.log(`   下载图片: ${downloadedCount} 张`);
  console.log(`   更新映射: ${updatedCount} 条 SKU`);
  if (DRY_RUN) console.log('   (DRY RUN，未实际写入)');
  console.log('═══════════════════════════════════\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
