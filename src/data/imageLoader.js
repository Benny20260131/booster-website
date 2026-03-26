/**
 * 图片加载器
 * 统一管理SKU图片的加载和显示
 */

// 直接导入映射表
import productImageMap from './product-image-map.json';

// 分类到默认图片的映射
const categoryDefaults = {
  '吸头': '/images/products/default-吸头.svg',
  '低吸附吸头': '/images/products/default-低吸附吸头.svg',
  'PCR': '/images/products/default-pcr.svg',
  'PCR板': '/images/products/default-pcr.svg',
  'PCR管': '/images/products/default-pcr.svg',
  '离心管': '/images/products/default-离心管.svg',
  '低吸附离心管': '/images/products/default-低吸附离心管.svg',
  '超滤离心管': '/images/products/default-离心管.svg',
  '培养': '/images/products/default-培养.svg',
  '培养皿': '/images/products/default-培养皿.svg',
  '培养板': '/images/products/default-培养板.svg',
  '培养瓶': '/images/products/default-培养瓶.svg',
  '细胞工厂': '/images/products/default-培养.svg',
  '细胞摇瓶': '/images/products/default-培养.svg',
  '酶标板': '/images/products/default-酶标板.svg',
  '深孔板': '/images/products/default-深孔板.svg',
  '试剂瓶': '/images/products/default-试剂瓶.svg',
  '保存管': '/images/products/default-保存管.svg',
  '冻存管': '/images/products/default-冻存管.svg',
  '移液管': '/images/products/default-移液管.svg',
  '过滤器': '/images/products/default-过滤器.svg'
};

/**
 * 获取SKU图片
 * @param {string} sku - SKU编号
 * @param {string} category - 产品分类
 * @param {string} type - 图片类型: 'main' | 'compressed' | 'thumb'
 * @returns {string} 图片URL
 */
export function getProductImage(sku, category = '', type = 'main') {
  // 1. 检查映射表
  const mapping = productImageMap[sku];
  if (mapping && mapping.image && !mapping.image.includes('default')) {
    // 保留原始文件扩展名（支持 jpg, png, webp）
    const ext = mapping.image.match(/\.(jpg|jpeg|png|webp)$/i)?.[1] || 'jpg';
    const baseName = mapping.image.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    
    switch (type) {
      case 'thumb':
        return `/images/products/${baseName}_thumb.webp`;
      case 'compressed':
        return `/images/products/${baseName}_compressed.webp`;
      default:
        return `/images/products/${baseName}.${ext}`;
    }
  }
  
  // 2. 返回分类默认图
  if (category && categoryDefaults[category]) {
    return categoryDefaults[category];
  }
  
  // 3. 返回通用默认图
  return '/images/products/default-product.svg';
}

/**
 * 检查SKU是否有真实图片
 * @param {string} sku - SKU编号
 * @returns {boolean}
 */
export function hasRealImage(sku) {
  const mapping = productImageMap[sku];
  return mapping && mapping.matchType !== 'default';
}

/**
 * 获取图片匹配信息
 * @param {string} sku - SKU编号
 * @returns {object|null}
 */
export function getImageInfo(sku) {
  return productImageMap[sku] || null;
}

/**
 * 获取图片加载优化配置
 * @returns {object}
 */
export function getImageLoadingConfig() {
  return {
    // 懒加载触发距离
    lazyOffset: '100px',
    // 占位图
    placeholder: '/images/products/default-product.svg',
    // 错误图
    errorImage: '/images/products/default-product.svg',
    // 图片尺寸
    sizes: {
      thumbnail: { width: 200, height: 200 },
      preview: { width: 400, height: 400 },
      full: { width: 800, height: 800 }
    }
  };
}

/**
 * 生成响应式图片srcset
 * @param {string} sku - SKU编号
 * @returns {string}
 */
export function generateSrcSet(sku) {
  const baseUrl = getProductImage(sku, '', 'main').replace('.jpg', '');
  return `
    ${baseUrl}_thumb.webp 200w,
    ${baseUrl}_compressed.webp 800w,
    ${baseUrl}.jpg 1200w
  `;
}

export default {
  getProductImage,
  hasRealImage,
  getImageInfo,
  getImageLoadingConfig,
  generateSrcSet
};
