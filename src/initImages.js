/**
 * 图片初始化脚本
 * 将爬取的图片导入到图片管理系统中
 */

import { ImageDatabase, ImageMatcher } from './imageManager';

// 爬取的图片数据（从final_images目录）
const CRAWLED_IMAGES = [
  // 分子生物类 - PCR产品
  { filename: '分子生物类_0.1mL_PCR_8联管_6.jpg', category: 'PCR', keywords: ['pcr', '8联管', '0.1ml', '管'] },
  { filename: '分子生物类_0.1mL_PCR_8联管（带缺口）_10.jpg', category: 'PCR', keywords: ['pcr', '8联管', '0.1ml', '缺口'] },
  { filename: '分子生物类_0.1mL_PCR_12联管_14.jpg', category: 'PCR', keywords: ['pcr', '12联管', '0.1ml'] },
  { filename: '分子生物类_0.2mL_PCR_8联管_8.jpg', category: 'PCR', keywords: ['pcr', '8联管', '0.2ml'] },
  { filename: '分子生物类_0.2mL_PCR_8联管（带缺口）_12.jpg', category: 'PCR', keywords: ['pcr', '8联管', '0.2ml', '缺口'] },
  { filename: '分子生物类_0.2mL_PCR_12联管_16.jpg', category: 'PCR', keywords: ['pcr', '12联管', '0.2ml'] },
  { filename: '分子生物类_透明平盖单管_18.jpg', category: 'PCR', keywords: ['pcr', '单管', '平盖'] },
  { filename: '分子生物类_PCR封板膜_4.jpg', category: 'PCR', keywords: ['pcr', '封板膜'] },
  
  // PCR板
  { filename: '分子生物类_0.1mL无裙边96孔PCR板_5.jpg', category: 'PCR板', keywords: ['pcr', '96孔', '0.1ml', '无裙边'] },
  { filename: '分子生物类_0.1mL半裙边96孔PCR板_9.jpg', category: 'PCR板', keywords: ['pcr', '96孔', '0.1ml', '半裙边'] },
  { filename: '分子生物类_0.1mL高裙边96孔PCR板_15.jpg', category: 'PCR板', keywords: ['pcr', '96孔', '0.1ml', '高裙边'] },
  { filename: '分子生物类_0.2mL无裙边96孔PCR板_7.jpg', category: 'PCR板', keywords: ['pcr', '96孔', '0.2ml', '无裙边'] },
  { filename: '分子生物类_0.2mL半裙边96孔PCR板_11.jpg', category: 'PCR板', keywords: ['pcr', '96孔', '0.2ml', '半裙边'] },
  { filename: '分子生物类_0.2mL高裙边96孔PCR板_17.jpg', category: 'PCR板', keywords: ['pcr', '96孔', '0.2ml', '高裙边'] },
  { filename: '分子生物类_0.2mL宽裙边96孔PCR板_13.jpg', category: 'PCR板', keywords: ['pcr', '96孔', '0.2ml', '宽裙边'] },
  { filename: 'PCR板_0.1mL全裙边96孔双色PCR板_46.jpg', category: 'PCR板', keywords: ['pcr', '96孔', '0.1ml', '全裙边', '双色'] },
  { filename: 'PCR管_PCR_盖子_32.jpg', category: 'PCR', keywords: ['pcr', '盖子'] },
  
  // 吸头
  { filename: '普通吸头_200uL普通吸头_115.jpg', category: '吸头', keywords: ['吸头', '200ul', '普通'] },
  { filename: '普通吸头_200uL普通加长吸头_116.jpg', category: '吸头', keywords: ['吸头', '200ul', '加长'] },
  { filename: '普通吸头_1000uL普通吸头_117.jpg', category: '吸头', keywords: ['吸头', '1000ul', '普通'] },
  { filename: '普通吸头_1000uL普通加长吸头_118.jpg', category: '吸头', keywords: ['吸头', '1000ul', '加长'] },
  { filename: '移液处理_10uL普通吸头_98.jpg', category: '吸头', keywords: ['吸头', '10ul'] },
  { filename: '移液处理_10uL加长普通吸头_102.jpg', category: '吸头', keywords: ['吸头', '10ul', '加长'] },
  { filename: '移液处理_50uL机械吸头_97.jpg', category: '吸头', keywords: ['吸头', '50ul', '机械'] },
  
  // 机械吸头
  { filename: '机械吸头_50uL机械吸头_129.jpg', category: '机械吸头', keywords: ['吸头', '50ul', '机械', 'tecan'] },
  { filename: '机械吸头_200uL导电吸头Tecan吸头_130.jpg', category: '机械吸头', keywords: ['吸头', '200ul', '导电', 'tecan'] },
  { filename: '机械吸头_1000uL机械吸头_131.jpg', category: '机械吸头', keywords: ['吸头', '1000ul', '机械'] },
  { filename: '移液处理_200uL导电吸头Tecan吸头_101.jpg', category: '机械吸头', keywords: ['吸头', '200ul', '导电', 'tecan'] },
  
  // 深孔板
  { filename: '深孔板_1.3mL圆孔U底深孔板_143.jpg', category: '深孔板', keywords: ['深孔板', '1.3ml', '圆孔', 'u底'] },
  { filename: '深孔板_2.2mL方孔U底深孔板_144.jpg', category: '深孔板', keywords: ['深孔板', '2.2ml', '方孔', 'u底'] },
  { filename: '深孔板_2.2mL方孔V底深孔板_145.jpg', category: '深孔板', keywords: ['深孔板', '2.2ml', '方孔', 'v底'] },
  { filename: '深孔板_磁棒套_146.jpg', category: '深孔板', keywords: ['磁棒套'] },
  { filename: '移液处理_1.3mL圆孔U底深孔板_96.jpg', category: '深孔板', keywords: ['深孔板', '1.3ml', '圆孔'] },
  { filename: '移液处理_2.2mL方孔U底深孔板_100.jpg', category: '深孔板', keywords: ['深孔板', '2.2ml', '方孔'] },
  
  // 酶标板
  { filename: '免疫类_C底8联条96孔可拆酶标板_64.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'c底', '8联条'] },
  { filename: '免疫类_F底8联条96孔可拆酶标板_65.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'f底', '8联条'] },
  { filename: '免疫类_F底12联条96孔可拆酶标板_66.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'f底', '12联条'] },
  { filename: '免疫类_A底8联条96孔可拆酶标板_67.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'a底', '8联条'] },
  { filename: '免疫类_A底12联条96孔可拆酶标板_68.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'a底', '12联条'] },
  { filename: '可拆酶标板_C底8联条96孔可拆酶标板_79.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'c底'] },
  { filename: '可拆酶标板_F底8联条96孔可拆酶标板_80.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'f底'] },
  { filename: '可拆酶标板_F底12联条96孔可拆酶标板_81.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'f底', '12联条'] },
  { filename: '可拆酶标板_A底8联条96孔可拆酶标板_82.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'a底'] },
  { filename: '可拆酶标板_A底12联条96孔可拆酶标板_83.jpg', category: '酶标板', keywords: ['酶标板', '96孔', '可拆', 'a底', '12联条'] },
  
  // 培养皿
  { filename: '微生物类_培养皿_170.jpg', category: '培养皿', keywords: ['培养皿'] },
  { filename: '细菌培养皿_培养皿_181.jpg', category: '培养皿', keywords: ['培养皿', '细菌'] },
  
  // 细胞培养
  { filename: '细胞培养类_细胞培养板_264.webp', category: '细胞培养', keywords: ['细胞培养', '培养板'] },
  { filename: '细胞培养类_细胞培养皿_266.webp', category: '细胞培养', keywords: ['细胞培养', '培养皿'] },
  { filename: '细胞培养类_细胞培养瓶_265.png', category: '细胞培养', keywords: ['细胞培养', '培养瓶'] },
  { filename: '细胞培养类_96孔透明底细胞培养板_260.webp', category: '细胞培养', keywords: ['细胞培养', '96孔', '透明底'] },
  { filename: '细胞培养类_96孔避光细胞培养板_261.webp', category: '细胞培养', keywords: ['细胞培养', '96孔', '避光'] },
  { filename: '细胞培养类_384孔透明底细胞培养板_262.webp', category: '细胞培养', keywords: ['细胞培养', '384孔', '透明底'] },
  { filename: '细胞培养类_384孔避光细胞培养板_263.webp', category: '细胞培养', keywords: ['细胞培养', '384孔', '避光'] },
  { filename: '细胞培养类_3.5cm玻底培养皿_267.png', category: '细胞培养', keywords: ['细胞培养', '玻底', '培养皿'] },
  { filename: '细胞培养类_三角摇瓶_268.webp', category: '细胞培养', keywords: ['细胞培养', '摇瓶', '三角'] },
  { filename: '细胞培养类_带挡板三角摇瓶_269.webp', category: '细胞培养', keywords: ['细胞培养', '摇瓶', '挡板'] },
  { filename: '细胞培养类_高效摇瓶_270.webp', category: '细胞培养', keywords: ['细胞培养', '摇瓶', '高效'] },
  { filename: '细胞培养类_方形培养基瓶_271.webp', category: '细胞培养', keywords: ['细胞培养', '培养基瓶'] },
  { filename: '细胞工厂_细胞工厂_278.png', category: '细胞培养', keywords: ['细胞工厂'] },
  { filename: '培养板_图片展示_276.jpg', category: '细胞培养', keywords: ['培养板'] },
  { filename: '培养皿_图片展示_277.png', category: '细胞培养', keywords: ['培养皿'] },
  { filename: '培养瓶_图片展示_278.png', category: '细胞培养', keywords: ['培养瓶'] },
  
  // 保存管
  { filename: '样品保存_0.5ml保存管_194.jpg', category: '保存管', keywords: ['保存管', '0.5ml'] },
  { filename: '样品保存_1.5mL保存管_197.jpg', category: '保存管', keywords: ['保存管', '1.5ml'] },
  { filename: '样品保存_2.0mL保存管_200.jpg', category: '保存管', keywords: ['保存管', '2.0ml'] },
  { filename: '保存管_0.51.52.0mL保存管盖子_214.jpg', category: '保存管', keywords: ['保存管', '盖子'] },
  
  // 离心管
  { filename: '样品保存_0.6mL锥底微量离心管_193.jpg', category: '离心管', keywords: ['离心管', '0.6ml', '微量'] },
  { filename: '样品保存_1.5mL锥底微量离心管_196.jpg', category: '离心管', keywords: ['离心管', '1.5ml', '微量'] },
  { filename: '样品保存_2mL锥底微量离心管_199.jpg', category: '离心管', keywords: ['离心管', '2ml', '微量'] },
  { filename: '微量离心管_5mL圆底离心管_228.jpg', category: '离心管', keywords: ['离心管', '5ml', '圆底'] },
  { filename: '微量离心管_10mL圆底离心管_229.jpg', category: '离心管', keywords: ['离心管', '10ml', '圆底'] },
  { filename: '微量离心管_15mL锥底离心管_230.jpg', category: '离心管', keywords: ['离心管', '15ml', '锥底'] },
  { filename: '微量离心管_50mL锥底离心管_231.jpg', category: '离心管', keywords: ['离心管', '50ml', '锥底'] },
  { filename: '微量离心管_50mL圆底离心管_232.jpg', category: '离心管', keywords: ['离心管', '50ml', '圆底'] },
  { filename: '微量离心管_50mL可立离心管_233.jpg', category: '离心管', keywords: ['离心管', '50ml', '可立'] },
  
  // 试剂瓶
  { filename: '样品保存_8mL广口试剂瓶_192.jpg', category: '试剂瓶', keywords: ['试剂瓶', '8ml', '广口'] },
  { filename: '样品保存_15mL广口试剂瓶_195.jpg', category: '试剂瓶', keywords: ['试剂瓶', '15ml', '广口'] },
  { filename: '样品保存_30mL广口试剂瓶_198.jpg', category: '试剂瓶', keywords: ['试剂瓶', '30ml', '广口'] },
  { filename: '试剂瓶_60mL广口试剂瓶_247.jpg', category: '试剂瓶', keywords: ['试剂瓶', '60ml', '广口'] },
  { filename: '试剂瓶_125mL广口试剂瓶_248.jpg', category: '试剂瓶', keywords: ['试剂瓶', '125ml', '广口'] },
  { filename: '试剂瓶_250mL广口试剂瓶_249.jpg', category: '试剂瓶', keywords: ['试剂瓶', '250ml', '广口'] },
  { filename: '试剂瓶_500mL广口试剂瓶_250.jpg', category: '试剂瓶', keywords: ['试剂瓶', '500ml', '广口'] },
  { filename: '试剂瓶_1000mL广口试剂瓶_251.jpg', category: '试剂瓶', keywords: ['试剂瓶', '1000ml', '广口'] },
  { filename: '试剂瓶_4mL窄口试剂瓶_252.jpg', category: '试剂瓶', keywords: ['试剂瓶', '4ml', '窄口'] },
  
  // 移液管
  { filename: '移液处理_普通移液管_95.jpg', category: '移液管', keywords: ['移液管', '普通'] },
  { filename: '移液处理_短款移液管_99.jpg', category: '移液管', keywords: ['移液管', '短款'] },
  { filename: '血清移液管_宽⼝移液管_159.jpg', category: '移液管', keywords: ['移液管', '宽口'] },
  
  // 封板膜
  { filename: '深孔板_铝箔封板膜_142.jpg', category: '封板膜', keywords: ['封板膜', '铝箔'] },
  { filename: '移液处理_铝箔封板膜_94.jpg', category: '封板膜', keywords: ['封板膜', '铝箔'] },
  
  // 磁珠
  { filename: '磁珠类_核酸提取磁性微球_315.png', category: '磁珠', keywords: ['磁珠', '核酸提取'] },
  { filename: '磁珠类_甲苯磺酰基磁珠_316.png', category: '磁珠', keywords: ['磁珠', '甲苯磺酰基'] },

  // 超滤离心管
  { filename: 'BSDT1YM500-05.png', category: '超滤离心管', keywords: ['超滤离心管', '50ml', '5kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM500-10.png', category: '超滤离心管', keywords: ['超滤离心管', '50ml', '10kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM500-30.png', category: '超滤离心管', keywords: ['超滤离心管', '50ml', '30kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM500-50.png', category: '超滤离心管', keywords: ['超滤离心管', '50ml', '50kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM500-100.png', category: '超滤离心管', keywords: ['超滤离心管', '50ml', '100kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM150-05.png', category: '超滤离心管', keywords: ['超滤离心管', '15ml', '5kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM150-10.png', category: '超滤离心管', keywords: ['超滤离心管', '15ml', '10kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM150-30.png', category: '超滤离心管', keywords: ['超滤离心管', '15ml', '30kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM150-50.png', category: '超滤离心管', keywords: ['超滤离心管', '15ml', '50kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM150-100.png', category: '超滤离心管', keywords: ['超滤离心管', '15ml', '100kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM005-03.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '3kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM005-05.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '5kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM005-10.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '10kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM005-30.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '30kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM005-50.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '50kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM005-100.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '100kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM0050-03.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '3kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM0050-05.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '5kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM0050-10.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '10kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM0050-30.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '30kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM0050-50.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '50kd', 'ultrafiltration'] },
  { filename: 'BSDT1YM0050-100.png', category: '超滤离心管', keywords: ['超滤离心管', '2ml', '100kd', 'ultrafiltration'] },

  // 细胞培养板
  { filename: '细胞培养类_96孔透明底细胞培养板_260.webp', category: '细胞培养', keywords: ['细胞培养板', '96孔', '透明底'] },
  { filename: 'BSDTCU096-T.png', category: '细胞培养', keywords: ['细胞培养板', '96孔', 'u底', 'tc'] },

  // 试剂槽
  { filename: '移液处理_1.3mL圆孔U底深孔板_96.jpg', category: '试剂槽', keywords: ['试剂槽', '50ml', '独立包装'] },

  // 封板膜
  { filename: '移液处理_铝箔封板膜_94.jpg', category: '封板膜', keywords: ['封板膜', '高温', '透明', '白色'] },

  // 萃取柱和试剂盒
  { filename: '样品保存_1.5mL锥底微量离心管_196.jpg', category: '前处理', keywords: ['萃取柱', '试剂盒', '质粒大提'] },

  // 缓冲液
  { filename: '样品保存_15mL广口试剂瓶_195.jpg', category: '生物试剂', keywords: ['dpbs', '磷酸盐缓冲液', '缓冲液'] },
];

/**
 * 初始化图片数据库
 */
export function initializeImages(imageBasePath = '/images/products/') {
  console.log('正在初始化图片数据库...');
  
  const db = new ImageDatabase();
  
  // 添加所有爬取的图片
  CRAWLED_IMAGES.forEach(imgData => {
    db.addImage({
      filename: imgData.filename,
      url: imageBasePath + imgData.filename,
      category: imgData.category,
      metadata: {
        keywords: imgData.keywords,
        source: 'crawled'
      }
    });
  });
  
  console.log(`已导入 ${CRAWLED_IMAGES.length} 张图片`);
  return db;
}

/**
 * 自动匹配产品图片
 */
export function autoMatchProducts(products, imageBasePath = '/images/products/') {
  console.log('开始自动匹配产品图片...');
  
  // 初始化图片库
  const images = CRAWLED_IMAGES.map(img => ({
    filename: img.filename,
    url: imageBasePath + img.filename,
    category: img.category,
    keywords: img.keywords
  }));
  
  const matcher = new ImageMatcher(images);
  
  // 转换产品数据格式
  const productList = products.map(p => ({
    sku: p.品牌货号 || p.sku,
    description: `${p.描述 || p.description || ''} ${p.规格 || p.specification || ''}`
  }));
  
  // 执行匹配
  const matches = matcher.batchMatch(productList);
  
  console.log(`匹配完成: ${matches.length}/${products.length}`);
  
  return matches;
}

/**
 * 导出匹配结果为JSON
 */
export function exportMatches(products, imageBasePath = '/images/products/') {
  const matches = autoMatchProducts(products, imageBasePath);
  
  const exportData = matches.map(match => ({
    sku: match.sku,
    description: match.description,
    imageUrl: match.imageUrl,
    imageFilename: match.imageFilename,
    confidence: match.confidence,
    alternativeImages: []
  }));
  
  return exportData;
}

export default {
  CRAWLED_IMAGES,
  initializeImages,
  autoMatchProducts,
  exportMatches
};
