/**
 * 图片管理系统
 * 功能：
 * 1. 自动匹配SKU与图片
 * 2. 批量上传和更新图片
 * 3. 图片与SKU关联数据库
 * 4. 支持本地和远程图片路径
 */

import { useState, useEffect, useCallback } from 'react';

// 图片数据库 - 本地存储键名
const STORAGE_KEY = 'booster_image_database';
const IMAGE_MATCH_KEY = 'booster_image_matches';

/**
 * 图片匹配算法
 * 根据SKU和描述自动匹配最合适的图片
 */
export class ImageMatcher {
  constructor(imageInventory = []) {
    this.imageInventory = imageInventory;
    this.matchCache = new Map();
  }

  /**
   * 提取关键词
   */
  extractKeywords(text) {
    if (!text) return [];
    
    // 清理文本
    const cleaned = text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ')
      .trim();
    
    // 分词（中文按字，英文按空格）
    const words = cleaned.split(/\s+/).filter(w => w.length >= 2);
    
    // 提取产品类型关键词
    const productTypes = [
      '吸头', 'tip', 'pcr', '管', 'tube', '板', 'plate', '皿', 'dish',
      '瓶', 'bottle', '离心管', '保存管', '深孔板', '酶标板',
      '培养', 'culture', '培养皿', '培养板', '培养瓶',
      '移液', 'pipette', '移液管', '移液器',
      '磁珠', 'bead', '磁性', 'magnetic',
      '试剂', 'reagent', '试剂瓶',
      '滤芯', 'filter', '滤芯吸头',
      '导电', 'conductive', 'tecan',
      '机械', 'robotic', '自动化',
      '透明', 'clear', '白色', 'white',
      '灭菌', 'sterile'
    ];
    
    const keywords = [];
    
    // 提取容量规格
    const volumeMatch = text.match(/(\d+(?:\.\d+)?)\s*(ml|ul|μl|mL|uL|L)/i);
    if (volumeMatch) {
      keywords.push(`${volumeMatch[1]}${volumeMatch[2].toLowerCase()}`);
    }
    
    // 提取孔数
    const wellMatch = text.match(/(\d+)\s*孔/);
    if (wellMatch) {
      keywords.push(`${wellMatch[1]}孔`);
    }
    
    // 匹配产品类型
    productTypes.forEach(type => {
      if (cleaned.includes(type.toLowerCase())) {
        keywords.push(type);
      }
    });
    
    return [...new Set([...keywords, ...words])];
  }

  /**
   * 计算匹配分数
   */
  calculateMatchScore(sku, description, imageFilename) {
    const skuKeywords = this.extractKeywords(sku);
    const descKeywords = this.extractKeywords(description);
    const imgKeywords = this.extractKeywords(imageFilename);
    
    let score = 0;
    
    // SKU匹配（高权重）
    skuKeywords.forEach(keyword => {
      if (imgKeywords.some(ik => ik.includes(keyword) || keyword.includes(ik))) {
        score += 10;
      }
    });
    
    // 描述匹配
    descKeywords.forEach(keyword => {
      if (imgKeywords.some(ik => ik.includes(keyword) || keyword.includes(ik))) {
        score += 5;
      }
    });
    
    // 产品类型匹配
    const productTypes = ['吸头', 'tip', 'pcr', '管', '板', '皿', '瓶', '培养', '移液', '磁珠'];
    productTypes.forEach(type => {
      const inDesc = descKeywords.some(k => k.includes(type));
      const inImg = imgKeywords.some(k => k.includes(type));
      if (inDesc && inImg) {
        score += 8;
      }
    });
    
    // 容量匹配
    const volumeMatch = description.match(/(\d+(?:\.\d+)?)\s*(ml|ul)/i);
    if (volumeMatch) {
      const vol = volumeMatch[1];
      if (imageFilename.includes(vol)) {
        score += 15;
      }
    }
    
    return score;
  }

  /**
   * 为SKU找到最佳匹配图片
   */
  findBestMatch(sku, description) {
    const cacheKey = `${sku}_${description}`;
    if (this.matchCache.has(cacheKey)) {
      return this.matchCache.get(cacheKey);
    }

    let bestMatch = null;
    let bestScore = 0;

    this.imageInventory.forEach(image => {
      const score = this.calculateMatchScore(sku, description, image.filename);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = image;
      }
    });

    const result = bestScore > 5 ? bestMatch : null;
    this.matchCache.set(cacheKey, result);
    return result;
  }

  /**
   * 批量匹配
   */
  batchMatch(products) {
    const matches = [];
    
    products.forEach(product => {
      const match = this.findBestMatch(product.sku, product.description);
      if (match) {
        matches.push({
          sku: product.sku,
          description: product.description,
          imageUrl: match.url,
          imageFilename: match.filename,
          confidence: this.calculateMatchScore(product.sku, product.description, match.filename)
        });
      }
    });
    
    return matches;
  }
}

/**
 * 图片数据库管理
 */
export class ImageDatabase {
  constructor() {
    this.images = this.loadFromStorage();
    this.matches = this.loadMatchesFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  loadMatchesFromStorage() {
    try {
      const data = localStorage.getItem(IMAGE_MATCH_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.images));
  }

  saveMatchesToStorage() {
    localStorage.setItem(IMAGE_MATCH_KEY, JSON.stringify(this.matches));
  }

  /**
   * 添加图片到数据库
   */
  addImage(imageData) {
    const image = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      filename: imageData.filename,
      url: imageData.url,
      category: imageData.category || '未分类',
      uploadTime: new Date().toISOString(),
      metadata: imageData.metadata || {}
    };
    
    this.images.push(image);
    this.saveToStorage();
    return image;
  }

  /**
   * 批量添加图片
   */
  batchAddImages(imageList) {
    const added = imageList.map(data => this.addImage(data));
    return added;
  }

  /**
   * 删除图片
   */
  removeImage(imageId) {
    this.images = this.images.filter(img => img.id !== imageId);
    this.saveToStorage();
  }

  /**
   * 获取所有图片
   */
  getAllImages() {
    return this.images;
  }

  /**
   * 按分类获取图片
   */
  getImagesByCategory(category) {
    return this.images.filter(img => img.category === category);
  }

  /**
   * 设置SKU与图片的关联
   */
  setMatch(sku, imageId, confidence = 100) {
    this.matches[sku] = {
      imageId,
      confidence,
      updatedAt: new Date().toISOString()
    };
    this.saveMatchesToStorage();
  }

  /**
   * 获取SKU匹配的图片
   */
  getMatch(sku) {
    const match = this.matches[sku];
    if (!match) return null;
    
    return this.images.find(img => img.id === match.imageId);
  }

  /**
   * 获取所有匹配
   */
  getAllMatches() {
    return Object.entries(this.matches).map(([sku, match]) => ({
      sku,
      ...match,
      image: this.images.find(img => img.id === match.imageId)
    }));
  }

  /**
   * 清除匹配
   */
  clearMatch(sku) {
    delete this.matches[sku];
    this.saveMatchesToStorage();
  }

  /**
   * 导出数据
   */
  exportData() {
    return {
      images: this.images,
      matches: this.matches,
      exportTime: new Date().toISOString()
    };
  }

  /**
   * 导入数据
   */
  importData(data) {
    if (data.images) {
      this.images = data.images;
      this.saveToStorage();
    }
    if (data.matches) {
      this.matches = data.matches;
      this.saveMatchesToStorage();
    }
  }
}

/**
 * React Hook - 图片管理
 */
export function useImageManager() {
  const [db] = useState(() => new ImageDatabase());
  const [images, setImages] = useState([]);
  const [matches, setMatches] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 刷新数据
  const refresh = useCallback(() => {
    setImages(db.getAllImages());
    setMatches(db.getAllMatches());
  }, [db]);

  // 初始化加载
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 添加图片
  const addImage = useCallback((imageData) => {
    const image = db.addImage(imageData);
    refresh();
    return image;
  }, [db, refresh]);

  // 批量添加
  const batchAddImages = useCallback((imageList) => {
    const added = db.batchAddImages(imageList);
    refresh();
    return added;
  }, [db, refresh]);

  // 删除图片
  const removeImage = useCallback((imageId) => {
    db.removeImage(imageId);
    refresh();
  }, [db, refresh]);

  // 设置匹配
  const setMatch = useCallback((sku, imageId, confidence) => {
    db.setMatch(sku, imageId, confidence);
    refresh();
  }, [db, refresh]);

  // 获取匹配
  const getMatch = useCallback((sku) => {
    return db.getMatch(sku);
  }, [db]);

  // 自动匹配
  const autoMatch = useCallback((products) => {
    setIsLoading(true);
    
    const matcher = new ImageMatcher(images);
    const matches = matcher.batchMatch(products);
    
    // 保存匹配结果
    matches.forEach(match => {
      const image = images.find(img => img.filename === match.imageFilename);
      if (image) {
        db.setMatch(match.sku, image.id, match.confidence);
      }
    });
    
    refresh();
    setIsLoading(false);
    return matches;
  }, [db, images, refresh]);

  // 导出数据
  const exportData = useCallback(() => {
    return db.exportData();
  }, [db]);

  // 导入数据
  const importData = useCallback((data) => {
    db.importData(data);
    refresh();
  }, [db, refresh]);

  return {
    images,
    matches,
    isLoading,
    addImage,
    batchAddImages,
    removeImage,
    setMatch,
    getMatch,
    autoMatch,
    exportData,
    importData,
    refresh
  };
}

/**
 * 文件上传处理
 */
export function handleFileUpload(files, basePath = '/images/') {
  return Array.from(files).map(file => {
    // 创建本地URL
    const url = URL.createObjectURL(file);
    
    return {
      filename: file.name,
      url: url,
      file: file,
      size: file.size,
      type: file.type,
      category: inferCategoryFromFilename(file.name)
    };
  });
}

/**
 * 从文件名推断分类
 */
function inferCategoryFromFilename(filename) {
  const categories = {
    '吸头': ['吸头', 'tip'],
    'PCR': ['pcr', '管', 'tube'],
    '培养': ['培养', 'culture', '皿', 'dish', '板', 'plate', '瓶', 'flask'],
    '移液': ['移液', 'pipette'],
    '离心': ['离心', '离心管'],
    '保存': ['保存', '保存管'],
    '磁珠': ['磁珠', '磁性', 'bead'],
    '试剂瓶': ['试剂瓶', '试剂']
  };

  const lowerName = filename.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => lowerName.includes(kw))) {
      return category;
    }
  }
  
  return '未分类';
}

export default {
  ImageMatcher,
  ImageDatabase,
  useImageManager,
  handleFileUpload
};
